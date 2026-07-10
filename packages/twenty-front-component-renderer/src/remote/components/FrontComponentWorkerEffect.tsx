import { release, retain } from '@quilted/threads';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { useEffect, useRef } from 'react';

import { buildHostFetchPolicyFromFrontComponentUrls } from '@/host/utils/buildHostFetchPolicyFromFrontComponentUrls';
import { createFrontComponentHostThread } from '@/host/utils/createFrontComponentHostThread';
import { createHostFetchEnforcingPolicy } from '@/host/utils/createHostFetchEnforcingPolicy';
import { FRONT_COMPONENT_SANDBOX_DOCUMENT } from '@/remote/sandbox/generated/frontComponentSandboxDocument';
import { createFrontComponentSandboxIframe } from '@/remote/sandbox/utils/createFrontComponentSandboxIframe';
import { createFrontComponentSandboxMessageHandler } from '@/remote/sandbox/utils/createFrontComponentSandboxMessageHandler';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type SdkClientUrls } from '@/types/SdkClientUrls';

type FrontComponentWorkerEffectProps = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
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
    });

    const hostFetch = createHostFetchEnforcingPolicy(hostFetchPolicy);

    const thread = createFrontComponentHostThread(channel.port1, hostFetch);

    const handleSandboxMessage = createFrontComponentSandboxMessageHandler({
      sandboxIframe,
      workerMessagePort: channel.port2,
      onSandboxError: setError,
    });

    window.addEventListener('message', handleSandboxMessage);

    setThread(thread);

    thread.imports
      .render(newReceiver.connection, {
        componentUrl,
        applicationAccessToken,
        apiUrl,
        functionsBaseUrl,
        sdkClientUrls,
        hostFetchOrigins: hostFetchPolicy.allowedOrigins,
        applicationVariables,
      })
      .catch((error: Error) => {
        setError(error);
      });

    setReceiver(newReceiver);
    isInitializedRef.current = true;

    return () => {
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
    applicationVariables,
    setError,
    setReceiver,
    setThread,
  ]);

  return null;
};
