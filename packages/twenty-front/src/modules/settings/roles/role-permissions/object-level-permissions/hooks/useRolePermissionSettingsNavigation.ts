import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { isNavigationModifierPressed } from '@/ui/navigation/utils/isNavigationModifierPressed';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { type MouseEvent } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useRolePermissionSettingsNavigation = ({
  roleId,
  objectMetadataId,
  fromAgentId,
}: {
  roleId: string;
  objectMetadataId?: string;
  fromAgentId?: string;
}) => {
  const navigateSettings = useNavigateSettings();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const routedFlowStateScopeId = useRoutedFlowStateScopeId();
  const workspaceSurface = useWorkspaceSurface();
  const queryParams = isDefined(fromAgentId)
    ? { fromAgent: fromAgentId }
    : undefined;
  const navigationUrl = isDefined(objectMetadataId)
    ? getSettingsPath(
        SettingsPath.RoleObjectLevel,
        { roleId, objectMetadataId },
        queryParams,
      )
    : getSettingsPath(SettingsPath.RoleAddObjectLevel, { roleId }, queryParams);
  const shouldOpenSidePanel =
    workspaceSurface.type === 'main' &&
    isDefined(fromAgentId) &&
    isDefined(routedFlowStateScopeId);

  const navigateToRolePermission = () => {
    if (shouldOpenSidePanel && isDefined(routedFlowStateScopeId)) {
      openRoutedPageInSidePanel({
        path: navigationUrl,
        routedFlowStateScopeId,
      });
      return;
    }

    if (isDefined(objectMetadataId)) {
      navigateSettings(
        SettingsPath.RoleObjectLevel,
        { roleId, objectMetadataId },
        queryParams,
      );
      return;
    }

    navigateSettings(SettingsPath.RoleAddObjectLevel, { roleId }, queryParams);
  };

  const handleNavigationClick = (event: MouseEvent<HTMLElement>) => {
    if (
      !shouldOpenSidePanel ||
      event.defaultPrevented ||
      isNavigationModifierPressed(event)
    ) {
      return;
    }

    event.preventDefault();
    navigateToRolePermission();
  };

  return { navigationUrl, navigateToRolePermission, handleNavigationClick };
};
