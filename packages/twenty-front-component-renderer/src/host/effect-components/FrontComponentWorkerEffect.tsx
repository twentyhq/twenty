import { release, retain } from '@quilted/threads';
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
import { createFrontComponentSandboxIframe } from '@/remote/sandbox/utils/createFrontComponentSandboxIframe';
import { createFrontComponentSandboxMessageHandler } from '@/remote/sandbox/utils/createFrontComponentSandboxMessageHandler';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type SdkClientUrls } from '@/types/SdkClientUrls';
import { buildAuthorizationHeadersFromAccessToken } from '@/host/component-source/utils/buildAuthorizationHeadersFromAccessToken';
import { containsSdkClientImportSpecifier } from '@/utils/module-imports/containsSdkClientImportSpecifier';
import { containsSharedDependenciesImportSpecifier } from '@/utils/module-imports/containsSharedDependenciesImportSpecifier';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
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

    const newReceiver = new RemoteReceiver({ retain, release });

    const sandboxIframe = createFrontComponentSandboxIframe(
      FRONT_COMPONENT_SANDBOX_DOCUMENT,
    );
    document.body.append(sandboxIframe);

    const channel = new MessageChannel();

    const hostFetchPolicy = buildHostFetchPolicyFromFrontComponentUrls({
      componentUrl,
      apiUrl,
      functionsBaseUrl,
      sdkClientUrls,
      sharedDependenciesUrl,
    });

    const hostFetch = createHostFetchEnforcingPolicy(hostFetchPolicy);
    const imageLoadingHost = createImageLoadingHost();
    const fileInputHost = createFileInputHost({ geometryTracker });

    const thread = createFrontComponentHostThread({
      hostMessagePort: channel.port1,
      hostFetch,
      imageLoadingHost,
      geometryTracker,
      mediaSessionHost,
    });

    const handleSandboxMessage = createFrontComponentSandboxMessageHandler({
      sandboxIframe,
      workerMessagePort: channel.port2,
      onSandboxError: setError,
    });

    window.addEventListener('message', handleSandboxMessage);

    setThread(thread);

    let isCancelled = false;

    const resolveComponentSourceAndRender = async () => {
      try {
        const authorizationHeaders = buildAuthorizationHeadersFromAccessToken(
          applicationAccessToken,
        );

        const componentSource = await fetchComponentSource({
          url: componentUrl,
          headers: authorizationHeaders,
        });

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

        await thread.imports.render(
          createFileInputAwareRemoteConnection({
            fileInputHost,
            connection: createFocusAwareRemoteConnection({
              connection: newReceiver.connection,
              hostFocusController,
            }),
          }),
          {
            componentUrl,
            componentSource,
            applicationAccessToken,
            apiUrl,
            functionsBaseUrl,
            sdkClientSources,
            sharedDependenciesSource,
            hostFetchOrigins: hostFetchPolicy.allowedOrigins,
            applicationVariables,
            initialViewportGeometry: geometryTracker.getViewportGeometry(),
            initialExecutionContext,
            storageSnapshots,
            mediaRecorderCapabilities:
              mediaSessionHost?.getRecorderCapabilities(),
          },
        );
      } catch (error) {
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
