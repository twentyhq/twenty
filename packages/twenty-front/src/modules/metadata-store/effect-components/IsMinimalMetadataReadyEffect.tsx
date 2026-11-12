import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceProvisioned } from 'twenty-shared/workspace';

export const IsMinimalMetadataReadyEffect = () => {
  const isLogged = useIsLogged();
  const currentUser = useAtomStateValue(currentUserState);
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
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
    if (!isLogged) {
      setIsMinimalMetadataReady(true);
      return;
    }

    const hasProvisionedWorkspace = isWorkspaceProvisioned(currentWorkspace);

    const areObjectsLoaded =
      metadataStoreObjectMetadataItems.status === 'up-to-date' &&
      metadataStoreFieldMetadataItems.status === 'up-to-date';
    const areViewsLoaded =
      metadataStoreViews.status === 'up-to-date' &&
      metadataStoreViewFields.status === 'up-to-date';

    if (!areObjectsLoaded) {
      setIsMinimalMetadataReady(false);
      return;
    }

    // A value cached by 2.55 has no records permissions, and missing permissions default to allow.
    const areRecordsPermissionsLoaded = isDefined(
      currentUserWorkspace?.objectRecordsPermissions,
    );

    const isReady =
      isDefined(currentUser) &&
      (!hasProvisionedWorkspace ||
        (areViewsLoaded && areRecordsPermissionsLoaded));

    if (isReady) {
      setIsMinimalMetadataReady(true);
    }
  }, [
    isLogged,
    currentUser,
    currentUserWorkspace,
    currentWorkspace,
    metadataStoreObjectMetadataItems.status,
    metadataStoreFieldMetadataItems.status,
    metadataStoreViews.status,
    metadataStoreViewFields.status,
    setIsMinimalMetadataReady,
  ]);

  return null;
};
