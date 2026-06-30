import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import {
  ViewVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const LOCKED_VIEW_PERSIST_UNAVAILABLE_REASON =
  'This workspace view is locked. You can temporarily change filters, but only admins can update the shared view.';
const WORKSPACE_VIEW_PERSIST_UNAVAILABLE_REASON =
  'Workspace views require manage views permission.';

export const useCanPersistViewChanges = () => {
  const { currentView } = useGetCurrentViewOnly();
  const hasViewsPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);

  if (!currentView) {
    return { canPersistChanges: false };
  }

  // Users with VIEWS permission can persist all views
  if (hasViewsPermission) {
    return { canPersistChanges: true };
  }

  if (currentView.isLocked === true) {
    return {
      canPersistChanges: false,
      persistChangesUnavailableReason: LOCKED_VIEW_PERSIST_UNAVAILABLE_REASON,
    };
  }

  // Users without VIEWS permission can only persist unlisted views
  // (which are always their own, filtered by backend)
  const canPersistChanges = currentView.visibility === ViewVisibility.UNLISTED;

  return {
    canPersistChanges,
    persistChangesUnavailableReason: canPersistChanges
      ? undefined
      : WORKSPACE_VIEW_PERSIST_UNAVAILABLE_REASON,
  };
};
