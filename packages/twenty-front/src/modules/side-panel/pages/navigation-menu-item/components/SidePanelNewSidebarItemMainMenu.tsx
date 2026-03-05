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

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useAddFolderToNavigationMenu } from '@/side-panel/pages/navigation-menu-item/hooks/useAddFolderToNavigationMenu';
import { useAddLinkToNavigationMenu } from '@/side-panel/pages/navigation-menu-item/hooks/useAddLinkToNavigationMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SidePanelNewSidebarItemMainMenuProps = {
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

export const SidePanelNewSidebarItemMainMenu = ({
  onSelectObject,
  onSelectView,
  onSelectRecord,
}: SidePanelNewSidebarItemMainMenuProps) => {
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
  const hasInsertionContext = isDefined(addMenuItemInsertionContext);
  const selectableItemIds = isAddingToFolder
    ? MAIN_MENU_ITEM_IDS.filter((itemId) => itemId !== 'folder')
    : [...MAIN_MENU_ITEM_IDS];

  return (
    <SidePanelAddToNavigationDroppable>
      {({ innerRef, droppableProps, placeholder }) => (
        <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={innerRef} {...droppableProps}>
            <SidePanelGroup heading={t`Data`}>
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
            </SidePanelGroup>
            <SidePanelGroup heading={t`Other`}>
              <SelectableListItem
                itemId="folder"
                onEnter={isAddingToFolder ? undefined : handleAddFolder}
              >
                <SidePanelItemWithAddToNavigationDrag
                  icon={IconFolder}
                  label={t`Folder`}
                  id="folder"
                  onClick={handleAddFolder}
                  dragIndex={hasInsertionContext ? undefined : 3}
                  payload={{
                    type: NavigationMenuItemType.FOLDER,
                    folderId: 'new',
                    name: t`New folder`,
                  }}
                  disabled={isAddingToFolder}
                  disableDrag={hasInsertionContext}
                />
              </SelectableListItem>
              <SelectableListItem itemId="link" onEnter={handleAddLink}>
                <SidePanelItemWithAddToNavigationDrag
                  icon={IconLink}
                  label={t`Link`}
                  id="link"
                  onClick={handleAddLink}
                  dragIndex={hasInsertionContext ? undefined : 4}
                  payload={{
                    type: NavigationMenuItemType.LINK,
                    linkId: 'new',
                    name: t`Link label`,
                    link: 'https://www.example.com',
                  }}
                  disableDrag={hasInsertionContext}
                />
              </SelectableListItem>
            </SidePanelGroup>
            {placeholder}
          </div>
        </SidePanelList>
      )}
    </SidePanelAddToNavigationDroppable>
  );
};
