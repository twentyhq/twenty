import { isAppLoadingState } from '@/app/states/isAppLoadingState';
import { metadataStoreState } from '@/app/states/metadataStoreState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const IsAppLoadingEffect = () => {
  const isLoggedIn = useIsLogged();
  const currentUser = useRecoilValueV2(currentUserState);
  const objectsEntry = useFamilyRecoilValueV2(metadataStoreState, 'objects');
  const viewsEntry = useFamilyRecoilValueV2(metadataStoreState, 'views');
  const setIsAppLoading = useSetRecoilStateV2(isAppLoadingState);

  useEffect(() => {
    const isLoading = isLoggedIn
      ? !isDefined(currentUser) ||
        objectsEntry.status !== 'loaded' ||
        viewsEntry.status !== 'loaded'
      : objectsEntry.status !== 'loaded';

    setIsAppLoading(isLoading);
  }, [
    isLoggedIn,
    currentUser,
    objectsEntry.status,
    viewsEntry.status,
    setIsAppLoading,
  ]);

  return null;
};
