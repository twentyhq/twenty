import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const IsMinimalMetadataReadyEffect = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const metadataStoreObjectMetadataItems = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  const metadataStoreFieldMetadataItems = useAtomFamilyStateValue(
    metadataStoreState,
    'fieldMetadataItems',
  );
  const metadataStoreViews = useAtomFamilyStateValue(
    metadataStoreState,
    'views',
  );
  const metadataStoreViewFields = useAtomFamilyStateValue(
    metadataStoreState,
    'viewFields',
  );
  const setIsMinimalMetadataReady = useSetAtomState(
    isMinimalMetadataReadyState,
  );

  useEffect(() => {
    if (!hasAccessTokenPair) {
      setIsMinimalMetadataReady(true);
      return;
    }

    const hasActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);

    const areObjectsLoaded =
      metadataStoreObjectMetadataItems.status === 'up-to-date' &&
      metadataStoreFieldMetadataItems.status === 'up-to-date';
    const areViewsLoaded =
      metadataStoreViews.status === 'up-to-date' &&
      metadataStoreViewFields.status === 'up-to-date';

    const isReady =
      isDefined(currentUser) &&
      (!hasActiveWorkspace || (areObjectsLoaded && areViewsLoaded));

    setIsMinimalMetadataReady(isReady);
  }, [
    hasAccessTokenPair,
    currentUser,
    currentWorkspace,
    metadataStoreObjectMetadataItems.status,
    metadataStoreFieldMetadataItems.status,
    metadataStoreViews.status,
    metadataStoreViewFields.status,
    setIsMinimalMetadataReady,
  ]);

  return null;
};
