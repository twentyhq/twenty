import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import {
  Avatar,
  IconBuildingSkyscraper,
  IconFolder,
  IconLink,
  IconTable,
} from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuAddToNavDraggablePlaceholder } from '@/command-menu/components/CommandMenuAddToNavDraggablePlaceholder';
import { CommandMenuAddToNavDroppable } from '@/command-menu/components/CommandMenuAddToNavDroppable';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useAddFolderToNavigationMenu } from '@/command-menu/pages/navigation-menu-item/hooks/useAddFolderToNavigationMenu';
import { useAddLinkToNavigationMenu } from '@/command-menu/pages/navigation-menu-item/hooks/useAddLinkToNavigationMenu';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuNewSidebarItemMainMenuProps = {
  onSelectObject: () => void;
  onSelectView: () => void;
  onSelectRecord: () => void;
};

export const CommandMenuNewSidebarItemMainMenu = ({
  onSelectObject,
  onSelectView,
  onSelectRecord,
}: CommandMenuNewSidebarItemMainMenuProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { handleAddFolder } = useAddFolderToNavigationMenu();
  const { handleAddLink } = useAddLinkToNavigationMenu();

  return (
    <CommandMenuAddToNavDroppable>
      {({ innerRef, droppableProps, placeholder }) => (
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={['object', 'view', 'record', 'folder', 'link']}
        >
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={innerRef} {...droppableProps}>
            <CommandGroup heading={t`Data`}>
              <CommandMenuAddToNavDraggablePlaceholder index={0}>
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
              </CommandMenuAddToNavDraggablePlaceholder>
              <CommandMenuAddToNavDraggablePlaceholder index={1}>
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
              </CommandMenuAddToNavDraggablePlaceholder>
              <CommandMenuAddToNavDraggablePlaceholder index={2}>
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
              </CommandMenuAddToNavDraggablePlaceholder>
            </CommandGroup>
            <CommandGroup heading={t`Other`}>
              <SelectableListItem itemId="folder" onEnter={handleAddFolder}>
                <CommandMenuItemWithAddToNavigationDrag
                  icon={IconFolder}
                  label={t`Folder`}
                  id="folder"
                  onClick={handleAddFolder}
                  dragIndex={3}
                  payload={{
                    type: NavigationMenuItemType.FOLDER,
                    folderId: 'new',
                    name: t`New folder`,
                  }}
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
