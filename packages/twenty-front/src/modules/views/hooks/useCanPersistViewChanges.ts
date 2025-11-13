import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { PermissionFlagType } from '~/generated/graphql';

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

  // Users without VIEWS permission can only persist unlisted views
  // (which are always their own, filtered by backend)
  const canPersistChanges = currentView.visibility === ViewVisibility.UNLISTED;

  return { canPersistChanges };
};
