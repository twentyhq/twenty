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
  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  // oxlint-disable-next-line twenty/matching-state-variable
  const fieldMetadataItemsStore = useAtomFamilyStateValue(
    metadataStoreState,
    'fieldMetadataItems',
  );
  // oxlint-disable-next-line twenty/matching-state-variable
  const viewsStore = useAtomFamilyStateValue(metadataStoreState, 'views');
  // oxlint-disable-next-line twenty/matching-state-variable
  const viewFieldsStore = useAtomFamilyStateValue(
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

    // The record-index page needs the joined view (view + viewFields) and the
    // joined object (object + fieldMetadataItems) to compute its columns. If
    // the gate opens before viewFields/fieldMetadataItems land, the view is
    // loaded with empty viewFields, RecordIndexLoadBaseOnContextStoreEffect
    // pins loadedViewId, and the record fetch is permanently skipped.
    const areObjectsLoaded =
      metadataStore.status === 'up-to-date' &&
      fieldMetadataItemsStore.status === 'up-to-date';
    const areViewsLoaded =
      viewsStore.status === 'up-to-date' &&
      viewFieldsStore.status === 'up-to-date';

    if (!areObjectsLoaded) {
      setIsMinimalMetadataReady(false);
      return;
    }

    const isReady =
      isDefined(currentUser) && (!hasActiveWorkspace || areViewsLoaded);

    if (isReady) {
      setIsMinimalMetadataReady(true);
    }
  }, [
    hasAccessTokenPair,
    currentUser,
    currentWorkspace,
    metadataStore.status,
    fieldMetadataItemsStore.status,
    viewsStore.status,
    viewFieldsStore.status,
    setIsMinimalMetadataReady,
  ]);

  return null;
};
