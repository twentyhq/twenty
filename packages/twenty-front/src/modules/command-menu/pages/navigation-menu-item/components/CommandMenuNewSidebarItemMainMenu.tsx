import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  Avatar,
  IconBuildingSkyscraper,
  IconFolder,
  IconLink,
  IconTable,
} from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuAddToNavDroppable } from '@/command-menu/components/CommandMenuAddToNavDroppable';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useAddFolderToNavigationMenu } from '@/command-menu/pages/navigation-menu-item/hooks/useAddFolderToNavigationMenu';
import { useAddLinkToNavigationMenu } from '@/command-menu/pages/navigation-menu-item/hooks/useAddLinkToNavigationMenu';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type CommandMenuNewSidebarItemMainMenuProps = {
  onSelectObject: () => void;
  onSelectView: () => void;
  onSelectRecord: () => void;
};

const MAIN_MENU_ITEM_IDS = [
  'object',
  'view',
  'record',
  'folder',
  'link',
] as const;

export const CommandMenuNewSidebarItemMainMenu = ({
  onSelectObject,
  onSelectView,
  onSelectRecord,
}: CommandMenuNewSidebarItemMainMenuProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const { handleAddFolder } = useAddFolderToNavigationMenu();
  const { handleAddLink } = useAddLinkToNavigationMenu();

  const isAddingToFolder = isDefined(
    addMenuItemInsertionContext?.targetFolderId,
  );
  const selectableItemIds = isAddingToFolder
    ? MAIN_MENU_ITEM_IDS.filter((itemId) => itemId !== 'folder')
    : [...MAIN_MENU_ITEM_IDS];

  return (
    <CommandMenuAddToNavDroppable>
      {({ innerRef, droppableProps, placeholder }) => (
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
        >
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={innerRef} {...droppableProps}>
            <CommandGroup heading={t`Data`}>
              <SelectableListItem itemId="object" onEnter={onSelectObject}>
                <CommandMenuItem
                  Icon={() => (
                    <NavigationMenuItemStyleIcon
                      Icon={IconBuildingSkyscraper}
                      color="blue"
                    />
                  )}
                  label={t`Object`}
                  id="object"
                  hasSubMenu={true}
                  onClick={onSelectObject}
                />
              </SelectableListItem>
              <SelectableListItem itemId="view" onEnter={onSelectView}>
                <CommandMenuItem
                  Icon={() => (
                    <NavigationMenuItemStyleIcon
                      Icon={IconTable}
                      color="gray"
                    />
                  )}
                  label={t`View`}
                  id="view"
                  hasSubMenu={true}
                  onClick={onSelectView}
                />
              </SelectableListItem>
              <SelectableListItem itemId="record" onEnter={onSelectRecord}>
                <CommandMenuItem
                  Icon={() => (
                    <Avatar
                      placeholder="L"
                      type="rounded"
                      backgroundColor={theme.color.green4}
                    />
                  )}
                  label={t`Record`}
                  id="record"
                  hasSubMenu={true}
                  onClick={onSelectRecord}
                />
              </SelectableListItem>
            </CommandGroup>
            <CommandGroup heading={t`Other`}>
              <SelectableListItem
                itemId="folder"
                onEnter={isAddingToFolder ? undefined : handleAddFolder}
              >
                <CommandMenuItemWithAddToNavigationDrag
                  icon={IconFolder}
                  label={t`Folder`}
                  id="folder"
                  onClick={handleAddFolder}
                  dragIndex={isAddingToFolder ? undefined : 3}
                  payload={{
                    type: NavigationMenuItemType.FOLDER,
                    folderId: 'new',
                    name: t`New folder`,
                  }}
                  disabled={isAddingToFolder}
                />
              </SelectableListItem>
              <SelectableListItem itemId="link" onEnter={handleAddLink}>
                <CommandMenuItemWithAddToNavigationDrag
                  icon={IconLink}
                  label={t`Link`}
                  id="link"
                  onClick={handleAddLink}
                  dragIndex={4}
                  payload={{
                    type: NavigationMenuItemType.LINK,
                    linkId: 'new',
                    name: t`Link label`,
                    link: 'https://www.example.com',
                  }}
                />
              </SelectableListItem>
            </CommandGroup>
            {placeholder}
          </div>
        </CommandMenuList>
      )}
    </CommandMenuAddToNavDroppable>
  );
};
