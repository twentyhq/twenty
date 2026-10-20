import { release, retain } from '@quilted/threads';
import { createBoundedRemoteConnection } from '@/host/utils/createBoundedRemoteConnection';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { createFileInputAwareRemoteConnection } from '@/host/file-input/utils/createFileInputAwareRemoteConnection';
import { createFileInputHost } from '@/host/file-input/utils/createFileInputHost';
import { type HostFocusController } from '@/host/focus/types/HostFocusController';
import { createFocusAwareRemoteConnection } from '@/host/focus/utils/createFocusAwareRemoteConnection';
import { buildHostFetchPolicyFromFrontComponentUrls } from '@/host/fetch/utils/buildHostFetchPolicyFromFrontComponentUrls';
import { createFrontComponentHostThread } from '@/host/thread/utils/createFrontComponentHostThread';
import { createImageLoadingHost } from '@/host/image-loading/utils/createImageLoadingHost';
import { createHostFetchEnforcingPolicy } from '@/host/fetch/utils/createHostFetchEnforcingPolicy';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type FrontComponentMediaSessionHost } from '@/host/media/types/FrontComponentMediaSessionHost';
import { fetchComponentSource } from '@/host/component-source/utils/fetchComponentSource';
import { fetchSdkClientSources } from '@/host/component-source/utils/fetchSdkClientSources';
import { buildFrontComponentStorageSnapshots } from '@/host/storage/utils/buildFrontComponentStorageSnapshots';
import { FRONT_COMPONENT_SANDBOX_DOCUMENT } from '@/remote/sandbox/generated/frontComponentSandboxDocument';
import { FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE } from '@/remote/sandbox/constants/FrontComponentSandboxMessageType';
import { createFrontComponentSandboxIframe } from '@/remote/sandbox/utils/createFrontComponentSandboxIframe';
import { createReadOnlyFrontComponentSandboxDocument } from '@/remote/sandbox/utils/createReadOnlyFrontComponentSandboxDocument';
import { createFrontComponentSandboxMessageHandler } from '@/remote/sandbox/utils/createFrontComponentSandboxMessageHandler';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { buildAuthorizationHeadersFromAccessToken } from '@/host/component-source/utils/buildAuthorizationHeadersFromAccessToken';
import { containsSdkClientImportSpecifier } from '@/utils/module-imports/containsSdkClientImportSpecifier';
import { containsSharedDependenciesImportSpecifier } from '@/utils/module-imports/containsSharedDependenciesImportSpecifier';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  componentSource?: string;
  sharedDependenciesSource?: string;
  readOnlyData?: Record<string, unknown>;
  onReady?: () => void;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  sharedDependenciesUrl?: string;
  applicationVariables?: Record<string, string>;
  storageNamespace?: string;
  initialExecutionContext: FrontComponentExecutionContext;
  geometryTracker: GeometryTracker;
  mediaSessionHost?: FrontComponentMediaSessionHost;
  setReceiver: React.Dispatch<React.SetStateAction<RemoteReceiver | null>>;
  hostFocusController: HostFocusController;
  setThread: React.Dispatch<React.SetStateAction<FrontComponentThread | null>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
};

export const FrontComponentWorkerEffect = ({
  hostFocusController,
  componentUrl,
  componentSource: suppliedComponentSource,
  sharedDependenciesSource: suppliedSharedDependenciesSource,
  readOnlyData,
  onReady,
  applicationAccessToken,
  apiUrl,
  functionsBaseUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
  applicationVariables,
  storageNamespace,
  initialExecutionContext,
  geometryTracker,
  mediaSessionHost,
  setReceiver,
  setThread,
  setError,
}: FrontComponentWorkerEffectProps) => {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }

    let sandboxIframe: HTMLIFrameElement;

    try {
      sandboxIframe = createFrontComponentSandboxIframe(
        isDefined(readOnlyData)
          ? createReadOnlyFrontComponentSandboxDocument(
              FRONT_COMPONENT_SANDBOX_DOCUMENT,
            )
          : FRONT_COMPONENT_SANDBOX_DOCUMENT,
      );
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      return;
    }

    const newReceiver = new RemoteReceiver({ retain, release });
    document.body.append(sandboxIframe);

    const channel = new MessageChannel();

    const hostFetchPolicy = isDefined(readOnlyData)
      ? {
          allowedOrigins: [],
          fileStorageRedirectableUrls: [],
        }
      : buildHostFetchPolicyFromFrontComponentUrls({
          componentUrl,
          apiUrl,
          functionsBaseUrl,
          sdkClientUrls,
          sharedDependenciesUrl,
        });

    const hostFetch = createHostFetchEnforcingPolicy(hostFetchPolicy);
    const imageLoadingHost = isDefined(readOnlyData)
      ? {
          loadImage: async () => {
            throw new Error('Images are unavailable in read-only components.');
          },
          cancelImage: async () => {},
          dispose: () => {},
        }
      : createImageLoadingHost();
    const fileInputHost = createFileInputHost({ geometryTracker });

    const thread = createFrontComponentHostThread({
      hostMessagePort: channel.port1,
      hostFetch,
      imageLoadingHost,
      geometryTracker,
      mediaSessionHost,
    });

    setThread(thread);

    let isCancelled = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    let heartbeat: ReturnType<typeof setTimeout> | undefined;

    const stopWorker = () => {
      clearTimeout(watchdog);
      clearTimeout(heartbeat);
      sandboxIframe.contentWindow?.postMessage(
        {
          type: FRONT_COMPONENT_SANDBOX_MESSAGE_TYPE.TERMINATE,
        },
        '*',
      );
    };
    const handleTimeout = () => {
      if (isCancelled) {
        return;
      }
      isCancelled = true;
      stopWorker();
      setThread(null);
      setReceiver(null);
      setError(new Error('Component stopped because it did not respond.'));
    };
    const handleSandboxMessage = createFrontComponentSandboxMessageHandler({
      sandboxIframe,
      workerMessagePort: channel.port2,
      onSandboxError: (error) => {
        if (isDefined(readOnlyData)) {
          stopWorker();
          setThread(null);
          setReceiver(null);
          isCancelled = true;
        }
        setError(error);
      },
    });

    window.addEventListener('message', handleSandboxMessage);

    const checkResponsiveness = () => {
      watchdog = setTimeout(handleTimeout, 3000);
      void thread.imports
        .ping()
        .then(() => {
          clearTimeout(watchdog);
          if (!isCancelled) {
            heartbeat = setTimeout(checkResponsiveness, 1000);
          }
        })
        .catch(handleTimeout);
    };

    if (isDefined(readOnlyData)) {
      watchdog = setTimeout(handleTimeout, 10000);
    }

    const resolveComponentSourceAndRender = async () => {
      try {
        const authorizationHeaders = buildAuthorizationHeadersFromAccessToken(
          applicationAccessToken,
        );

        const componentSource =
          suppliedComponentSource ??
          (await fetchComponentSource({
            url: componentUrl,
            headers: authorizationHeaders,
          }));

        if (isCancelled) {
          return;
        }

        const [sdkClientSources, sharedDependenciesSource] = await Promise.all([
          isDefined(sdkClientUrls) &&
          containsSdkClientImportSpecifier(componentSource)
            ? fetchSdkClientSources({
                sdkClientUrls,
                headers: authorizationHeaders,
              })
            : undefined,
          isDefined(sharedDependenciesUrl) &&
          containsSharedDependenciesImportSpecifier(componentSource)
            ? fetchComponentSource({
                url: sharedDependenciesUrl,
                headers: authorizationHeaders,
              })
            : undefined,
        ]);

        if (isCancelled) {
          return;
        }

        const storageSnapshots = isDefined(storageNamespace)
          ? buildFrontComponentStorageSnapshots(storageNamespace)
          : undefined;

        const connection = createFileInputAwareRemoteConnection({
          fileInputHost,
          connection: createFocusAwareRemoteConnection({
            connection: newReceiver.connection,
            hostFocusController,
          }),
        });

        await thread.imports.render(
          isDefined(readOnlyData)
            ? createBoundedRemoteConnection(connection, () => {
                handleTimeout();
                setError(
                  new Error(
                    'Component stopped because it exceeded the rendering limit.',
                  ),
                );
              })
            : connection,
          {
            componentUrl,
            componentSource,
            componentProps: readOnlyData,
            applicationAccessToken,
            apiUrl,
            functionsBaseUrl,
            sdkClientSources,
            sharedDependenciesSource:
              suppliedSharedDependenciesSource ?? sharedDependenciesSource,
            hostFetchOrigins: hostFetchPolicy.allowedOrigins,
            applicationVariables,
            initialViewportGeometry: geometryTracker.getViewportGeometry(),
            initialExecutionContext,
            storageSnapshots,
            mediaRecorderCapabilities:
              mediaSessionHost?.getRecorderCapabilities(),
          },
        );
        if (!isCancelled) {
          clearTimeout(watchdog);
          if (isDefined(readOnlyData)) {
            heartbeat = setTimeout(checkResponsiveness, 1000);
          }
          onReady?.();
        }
      } catch (error) {
        stopWorker();
        if (!isCancelled) {
          setError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    resolveComponentSourceAndRender();

    setReceiver(newReceiver);
    isInitializedRef.current = true;

    return () => {
      isCancelled = true;
      stopWorker();
      imageLoadingHost.dispose();
      fileInputHost.dispose();
      hostFocusController.reset();
      window.removeEventListener('message', handleSandboxMessage);
      setThread(null);
      channel.port1.close();
      sandboxIframe.remove();
      isInitializedRef.current = false;
    };
  }, [
    componentUrl,
    suppliedComponentSource,
    suppliedSharedDependenciesSource,
    readOnlyData,
    onReady,
    applicationAccessToken,
    apiUrl,
    functionsBaseUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    applicationVariables,
    storageNamespace,
    initialExecutionContext,
    geometryTracker,
    hostFocusController,
    mediaSessionHost,
    setError,
    setReceiver,
    setThread,
  ]);

  return null;
};
