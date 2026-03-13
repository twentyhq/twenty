import { useAtomValue, useStore } from 'jotai';
import { useEffect, useRef, useState } from 'react';

import {
  type SdkClientBlobUrls,
  sdkClientBlobUrlsFamilyState,
} from '@/front-components/states/sdkClientBlobUrlsFamilyState';
import { fetchSdkClientBlobUrls } from '@/front-components/utils/fetchSdkClientBlobUrls';
import { isDefined } from 'twenty-shared/utils';

const revokeBlobUrls = (blobUrls: SdkClientBlobUrls) => {
  URL.revokeObjectURL(blobUrls.core);
  URL.revokeObjectURL(blobUrls.metadata);
};

export const useApplicationSdkClient = ({
  applicationId,
  accessToken,
}: {
  applicationId: string;
  accessToken: string;
}): {
  sdkClientBlobUrls: SdkClientBlobUrls | null;
  isLoading: boolean;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const store = useStore();

  const atom = sdkClientBlobUrlsFamilyState.atomFamily(applicationId);
  const sdkClientBlobUrls = useAtomValue(atom);

  useEffect(() => {
    if (isDefined(sdkClientBlobUrls) || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    fetchSdkClientBlobUrls(applicationId, accessToken)
      .then((blobUrls) => {
        const targetAtom =
          sdkClientBlobUrlsFamilyState.atomFamily(applicationId);
        const previousBlobUrls = store.get(targetAtom);

        if (isDefined(previousBlobUrls)) {
          revokeBlobUrls(previousBlobUrls);
        }

        store.set(targetAtom, blobUrls);
      })
      .finally(() => {
        isFetchingRef.current = false;
        setIsLoading(false);
      });
  }, [applicationId, accessToken, sdkClientBlobUrls, store]);

  useEffect(() => {
    return () => {
      const targetAtom =
        sdkClientBlobUrlsFamilyState.atomFamily(applicationId);
      const currentBlobUrls = store.get(targetAtom);

      if (isDefined(currentBlobUrls)) {
        revokeBlobUrls(currentBlobUrls);
        store.set(targetAtom, null);
      }
    };
  }, [applicationId, store]);

  return {
    sdkClientBlobUrls,
    isLoading,
  };
};
