import { useCallback, useState } from 'react';
import { useStore } from 'jotai';

import {
  type SdkClientBlobUrls,
  sdkClientBlobUrlsFamilyState,
} from '@/front-components/states/sdkClientBlobUrlsFamilyState';
import { fetchSdkClientBlobUrls } from '@/front-components/utils/fetchSdkClientBlobUrls';
import { isDefined } from 'twenty-shared/utils';

const inflightRequests = new Map<string, Promise<SdkClientBlobUrls>>();

export const useSdkClientBlobUrls = (): {
  sdkClientBlobUrls: SdkClientBlobUrls | undefined;
  isLoading: boolean;
  loadSdkClient: (params: {
    applicationId: string;
    accessToken: string;
  }) => void;
} => {
  const store = useStore();

  const [sdkClientBlobUrls, setSdkClientBlobUrls] = useState<
    SdkClientBlobUrls | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const loadSdkClient = useCallback(
    async ({
      applicationId,
      accessToken,
    }: {
      applicationId: string;
      accessToken: string;
    }) => {
      const atom = sdkClientBlobUrlsFamilyState.atomFamily(applicationId);
      const cached = store.get(atom);

      if (isDefined(cached)) {
        setSdkClientBlobUrls(cached);

        return;
      }

      setIsLoading(true);

      try {
        const requestToAwait =
          inflightRequests.get(applicationId) ??
          fetchSdkClientBlobUrls(applicationId, accessToken);

        if (!inflightRequests.has(applicationId)) {
          inflightRequests.set(applicationId, requestToAwait);
        }

        const blobUrls = await requestToAwait;

        store.set(atom, blobUrls);
        setSdkClientBlobUrls(blobUrls);
      } finally {
        inflightRequests.delete(applicationId);
        setIsLoading(false);
      }
    },
    [store],
  );

  return {
    sdkClientBlobUrls,
    isLoading,
    loadSdkClient,
  };
};
