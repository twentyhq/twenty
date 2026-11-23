import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components/input';

import { useWorkspaceSidebarRootContainerId } from '@/navigation-menu-item/display/hooks/useWorkspaceSidebarRootContainerId';
import { NavigationMenuItemAddDropdown } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdown';

type WorkspaceSectionHeaderAddDropdownProps = {
  onOpen: () => void;
};

// TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
export const WorkspaceSectionHeaderAddDropdown = ({
  onOpen,
}: WorkspaceSectionHeaderAddDropdownProps) => {
  const { t } = useLingui();
  const workspaceSidebarRootContainerId = useWorkspaceSidebarRootContainerId();

  const addButton = (
    <LightIconButton emphasis="subtle" size="sm" aria-label={t`Add`}>
      <IconPlus />
    </LightIconButton>
  );

  if (isDefined(workspaceSidebarRootContainerId)) {
    return (
      <NavigationMenuItemAddDropdown
        instanceId="workspace-header"
        shouldShowHiddenItems
        parentId={workspaceSidebarRootContainerId}
        position={0}
        onOpen={onOpen}
      >
        {addButton}
      </NavigationMenuItemAddDropdown>
    );
  }

  return (
    <NavigationMenuItemAddDropdown
      instanceId="workspace-header"
      shouldShowHiddenItems
      position={0}
      onOpen={onOpen}
    >
      {addButton}
    </NavigationMenuItemAddDropdown>
  );
};
