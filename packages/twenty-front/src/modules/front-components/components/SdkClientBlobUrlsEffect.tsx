import { useStore } from 'jotai';
import { useEffect } from 'react';

import { sdkClientFamilyState } from '@/front-components/states/sdkClientFamilyState';
import { fetchSdkClientBlobUrls } from '@/front-components/utils/fetchSdkClientBlobUrls';

export const SdkClientBlobUrlsEffect = ({
  applicationId,
  accessToken,
  onError,
}: {
  applicationId: string;
  accessToken: string;
  onError?: (error: Error) => void;
}) => {
  const store = useStore();

  useEffect(() => {
    const atom = sdkClientFamilyState.atomFamily(applicationId);
    const { status } = store.get(atom);

    if (status === 'loading' || status === 'loaded') {
      return;
    }

    store.set(atom, { status: 'loading' });

    const fetchBlobUrls = async () => {
      try {
        const blobUrls = await fetchSdkClientBlobUrls(
          applicationId,
          accessToken,
        );

        store.set(atom, { status: 'loaded', blobUrls });
      } catch (error: unknown) {
        const normalizedError =
          error instanceof Error ? error : new Error(String(error));

        store.set(atom, { status: 'error', error: normalizedError });
        onError?.(normalizedError);
      }
    };

    fetchBlobUrls();
  }, [applicationId, accessToken, store, onError]);

  return null;
};
