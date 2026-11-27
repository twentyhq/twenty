import { useLingui } from '@lingui/react/macro';
import { useCallback, useRef, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconDotsVertical } from 'twenty-ui/icon';

import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { navigationMenuSectionIdAddingItemState } from '@/navigation-menu-item/common/states/navigationMenuSectionIdAddingItemState';
import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';
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
    | 'id'
    | 'name'
    | 'icon'
    | 'parentId'
    | 'type'
    | 'builtInSectionKey'
    | 'visibleItemLimit'
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
  const [
    navigationMenuSectionIdAddingItem,
    setNavigationMenuSectionIdAddingItem,
  ] = useAtomState(navigationMenuSectionIdAddingItemState);
  const { openNavigationSection } = useNavigationSection(
    getNavigationMenuSectionNavigationSectionId(section),
  );
  const dropdownId = getNavigationMenuSectionMenuDropdownId(section.id);
  const isBuiltInSection = isNavigationMenuItemBuiltInSection(section);
  const isAddingItemFromContextMenu =
    navigationMenuSectionIdAddingItem === section.id;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleAddingItemOpen = useCallback(() => {
    openNavigationSection();
    triggerRef.current?.scrollIntoView({ block: 'center' });
  }, [openNavigationSection]);

  const clearAddingItemFromContextMenu = () => {
    if (isAddingItemFromContextMenu) {
      setNavigationMenuSectionIdAddingItem(null);
    }
  };

  return (
    <NavigationMenuItemMenu
      section="workspace"
      dropdownId={dropdownId}
      trigger={
        <LightIconButton
          ref={triggerRef}
          emphasis="subtle"
          size="sm"
          aria-label={t`Section actions`}
        >
          <IconDotsVertical />
        </LightIconButton>
      }
      mode={
        isAddingItemFromContextMenu
          ? { type: 'add', parentId: section.id }
          : mode
      }
      onModeChange={(nextMode) => {
        clearAddingItemFromContextMenu();
        setMode(nextMode);
      }}
      onClose={() => {
        clearAddingItemFromContextMenu();
        setMode({ type: 'actions' });
      }}
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
      {isAddingItemFromContextMenu && (
        <NavigationMenuItemDropdownOpenEffect
          dropdownId={dropdownId}
          onOpen={handleAddingItemOpen}
        />
      )}
    </NavigationMenuItemMenu>
  );
};
