import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconDotsVertical } from 'twenty-ui/icon';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { NavigationMenuItemMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';
import { NavigationMenuSectionMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuSectionMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { type NavigationMenuItemMenuMode } from '@/navigation-menu-item/edit/types/NavigationMenuItemMenuMode';
import { getNavigationMenuSectionMenuDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuSectionMenuDropdownId';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuSectionMenuProps = {
  section: Pick<
    NavigationMenuItem,
    'id' | 'name' | 'icon' | 'parentId' | 'type' | 'builtInSectionKey'
  >;
};

export const NavigationMenuSectionMenu = ({
  section,
}: NavigationMenuSectionMenuProps) => {
  const { t } = useLingui();
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const [mode, setMode] = useState<NavigationMenuItemMenuMode>({
    type: 'actions',
  });
  const { openNavigationSection } = useNavigationSection(
    `navigation-menu-section-${section.id}`,
  );
  const dropdownId = getNavigationMenuSectionMenuDropdownId(section.id);
  const isBuiltInSection = isNavigationMenuItemBuiltInSection(section);

  return (
    <NavigationMenuItemMenu
      section="workspace"
      dropdownId={dropdownId}
      trigger={
        <LightIconButton
          emphasis="subtle"
          size="sm"
          aria-label={t`Section actions`}
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      mode={mode}
      onModeChange={setMode}
      onClose={() => setMode({ type: 'actions' })}
      renderMenu={({ onClose, onAdd }) => {
        const handleAddItem = () => {
          openNavigationSection();
          onAdd({ parentId: section.id });
        };

        return (
          <NavigationMenuSectionMenuContent
            section={section}
            onAddItem={isBuiltInSection ? undefined : handleAddItem}
            onClose={onClose}
          />
        );
      }}
    >
      {navigationMenuItemIdToRename === section.id && (
        <NavigationMenuItemDropdownOpenEffect
          dropdownId={dropdownId}
          onOpen={() => setNavigationMenuItemIdToRename(null)}
        />
      )}
    </NavigationMenuItemMenu>
  );
};
