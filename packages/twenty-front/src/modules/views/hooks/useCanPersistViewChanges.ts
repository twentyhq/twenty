import { useHasPermissionFlagGrant } from '@/settings/roles/hooks/useHasPermissionFlagGrant';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import {
  ViewVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useCanPersistViewChanges = () => {
  const { currentView } = useGetCurrentViewOnly();
  const hasViewsPermission = useHasPermissionFlagGrant(
    PermissionFlagType.VIEWS,
  );

  if (!currentView) {
    return { canPersistChanges: false };
  }

  // Users with VIEWS permission can persist all views
  if (hasViewsPermission) {
    return { canPersistChanges: true };
  }

  // Users without VIEWS permission can only persist unlisted views
  // (which are always their own, filtered by backend)
  const canPersistChanges = currentView.visibility === ViewVisibility.UNLISTED;

  return { canPersistChanges };
};
