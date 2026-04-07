import { ThreadWebWorker, release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useRef } from 'react';
import { type CommandConfirmationModalResult } from 'twenty-sdk';
import { type ConfirmationModalCaller } from 'twenty-shared/types';
import { type FrontComponentHostCommunicationApi } from '../../types/FrontComponentHostCommunicationApi';
import { type SdkClientUrls } from '../../types/HostToWorkerRenderContext';
import { type WorkerExports } from '../../types/WorkerExports';
import { createRemoteWorker } from '../worker/utils/createRemoteWorker';

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
  };

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  frontComponentId: string;
  setReceiver: React.Dispatch<React.SetStateAction<RemoteReceiver | null>>;
  setThread: React.Dispatch<
    React.SetStateAction<ThreadWebWorker<
      WorkerExports,
      FrontComponentHostCommunicationApi
    > | null>
  >;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};

export const FrontComponentWorkerEffect = ({
  componentUrl,
  applicationAccessToken,
  apiUrl,
  sdkClientUrls,
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

    const worker = createRemoteWorker();

    worker.onerror = (event: ErrorEvent) => {
      const workerError =
        event.error ?? new Error(event.message || 'Unknown worker error');

      console.error('[FrontComponentRenderer] Worker error:', workerError);
      setError(workerError);
    };

    const thread = new ThreadWebWorker<
      WorkerExports,
      FrontComponentHostCommunicationApi
    >(worker, {
      exports: { ...HOST_COMMUNICATION_API_NOOP_INITIALIZATION },
    });

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
        sdkClientUrls,
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
      setThread(null);
      worker.terminate();
      isInitializedRef.current = false;
    };
  }, [
    componentUrl,
    applicationAccessToken,
    apiUrl,
    sdkClientUrls,
    frontComponentId,
    setError,
    setReceiver,
    setThread,
  ]);

  return null;
};
