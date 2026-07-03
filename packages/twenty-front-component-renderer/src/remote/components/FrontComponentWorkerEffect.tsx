import { ThreadMessagePort, release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useRef } from 'react';
import { type CommandConfirmationModalResult } from 'twenty-sdk/front-component';
import { type ConfirmationModalCaller } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createHostFetch } from '@/host/utils/createHostFetch';
import { FRONT_COMPONENT_SANDBOX_MESSAGE } from '@/remote/sandbox/frontComponentSandboxMessages';
import { createFrontComponentSandboxIframe } from '@/remote/sandbox/utils/createFrontComponentSandboxIframe';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type FrontComponentHostThreadExports } from '../../types/FrontComponentHostThreadExports';
import { type SdkClientUrls } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
// @ts-expect-error - Vite asset URL import
import sandboxDocumentUrl from '@/remote/sandbox/front-component-sandbox.html?url';

// Must match COMMAND_MENU_ITEM_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME in twenty-front
const COMMAND_MENU_ITEM_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME =
  'command-menu-item-confirmation-modal-result';

type CommandMenuItemConfirmationModalResultBrowserEventDetail = {
  caller: ConfirmationModalCaller;
  confirmationResult: CommandConfirmationModalResult;
};

const noopAsync = async () => {};

const HOST_COMMUNICATION_API_NOOP_INITIALIZATION: FrontComponentHostCommunicationApi =
  {
    navigate: noopAsync,
    requestAccessTokenRefresh: async () => '',
    openSidePanelPage: noopAsync,
    openCommandConfirmationModal: noopAsync,
    unmountFrontComponent: noopAsync,
    enqueueSnackbar: noopAsync,
    closeSidePanel: noopAsync,
    updateProgress: noopAsync,
    copyToClipboard: noopAsync,
  };

export type FrontComponentThread = ThreadMessagePort<
  WorkerExports,
  FrontComponentHostThreadExports
>;

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
  frontComponentId: string;
  setReceiver: React.Dispatch<React.SetStateAction<RemoteReceiver | null>>;
  setThread: React.Dispatch<React.SetStateAction<FrontComponentThread | null>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};

export const FrontComponentWorkerEffect = ({
  componentUrl,
  applicationAccessToken,
  apiUrl,
  functionsBaseUrl,
  sdkClientUrls,
  applicationVariables,
  frontComponentId,
  setReceiver,
  setThread,
  setError,
}: FrontComponentWorkerEffectProps) => {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    const newReceiver = new RemoteReceiver({ retain, release });

    const sandboxIframe = createFrontComponentSandboxIframe(
      sandboxDocumentUrl as string,
    );
    document.body.append(sandboxIframe);

    const channel = new MessageChannel();

    const hostFetch = createHostFetch(
      [apiUrl, functionsBaseUrl, componentUrl].filter(isDefined),
    );

    const thread = new ThreadMessagePort<
      WorkerExports,
      FrontComponentHostThreadExports
    >(channel.port1, {
      exports: { ...HOST_COMMUNICATION_API_NOOP_INITIALIZATION, hostFetch },
    });
    channel.port1.start();

    const handleSandboxMessage = (event: MessageEvent) => {
      if (event.source !== sandboxIframe.contentWindow) {
        return;
      }

      const messageType = (event.data as { type?: string } | null)?.type;

      if (messageType === FRONT_COMPONENT_SANDBOX_MESSAGE.READY) {
        sandboxIframe.contentWindow?.postMessage(
          { type: FRONT_COMPONENT_SANDBOX_MESSAGE.INIT },
          '*',
          [channel.port2],
        );
        return;
      }

      if (messageType === FRONT_COMPONENT_SANDBOX_MESSAGE.ERROR) {
        const message = (event.data as { message?: string }).message;
        setError(new Error(message || 'Unknown front component worker error'));
      }
    };

    window.addEventListener('message', handleSandboxMessage);

    const handleCommandMenuItemConfirmationModalResultBrowserEvent = (
      event: CustomEvent<CommandMenuItemConfirmationModalResultBrowserEventDetail>,
    ) => {
      const commandMenuItemConfirmationModalResultBrowserEventDetail =
        event.detail;

      const caller =
        commandMenuItemConfirmationModalResultBrowserEventDetail.caller;

      if (
        caller.type !== 'frontComponent' ||
        caller.frontComponentId !== frontComponentId
      ) {
        return;
      }

      thread.imports
        .onConfirmationModalResult(
          commandMenuItemConfirmationModalResultBrowserEventDetail.confirmationResult,
        )
        .catch((error: Error) => {
          setError(error);
        });
    };

    window.addEventListener(
      COMMAND_MENU_ITEM_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
      handleCommandMenuItemConfirmationModalResultBrowserEvent as EventListener,
    );

    setThread(thread);

    thread.imports
      .render(newReceiver.connection, {
        componentUrl,
        applicationAccessToken,
        apiUrl,
        functionsBaseUrl,
        sdkClientUrls,
        applicationVariables,
      })
      .catch((error: Error) => {
        setError(error);
      });

    setReceiver(newReceiver);
    isInitializedRef.current = true;

    return () => {
      window.removeEventListener(
        COMMAND_MENU_ITEM_CONFIRMATION_MODAL_RESULT_BROWSER_EVENT_NAME,
        handleCommandMenuItemConfirmationModalResultBrowserEvent as EventListener,
      );
      window.removeEventListener('message', handleSandboxMessage);
      setThread(null);
      channel.port1.close();
      if (isDefined(sandboxIframe.parentNode)) {
        sandboxIframe.remove();
      }
      isInitializedRef.current = false;
    };
  }, [
    componentUrl,
    applicationAccessToken,
    apiUrl,
    functionsBaseUrl,
    sdkClientUrls,
    applicationVariables,
    frontComponentId,
    setError,
    setReceiver,
    setThread,
  ]);

  return null;
};
