import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  Avatar,
  IconBuildingSkyscraper,
  IconFolder,
  IconLink,
  IconTable,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useAddFolderToNavigationMenu } from '@/navigation-menu-item/edit/side-panel/hooks/useAddFolderToNavigationMenu';
import { useAddLinkToNavigationMenu } from '@/navigation-menu-item/edit/side-panel/hooks/useAddLinkToNavigationMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type SidePanelNewSidebarItemMainMenuProps = {
  onSelectObject: () => void;
  onSelectView: () => void;
  onSelectRecord: () => void;
};

const MAIN_MENU_ITEM_TYPES = [
  NavigationMenuItemType.OBJECT,
  NavigationMenuItemType.VIEW,
  NavigationMenuItemType.RECORD,
  NavigationMenuItemType.FOLDER,
  NavigationMenuItemType.LINK,
] as const;

export const SidePanelNewSidebarItemMainMenu = ({
  onSelectObject,
  onSelectView,
  onSelectRecord,
}: SidePanelNewSidebarItemMainMenuProps) => {
  const { t } = useLingui();
  const pendingInsertionNavigationMenuItem = useAtomStateValue(
    pendingInsertionNavigationMenuItemState,
  );
  const { handleAddFolder } = useAddFolderToNavigationMenu();
  const { handleAddLink } = useAddLinkToNavigationMenu();

  const isAddingToFolder = isDefined(
    pendingInsertionNavigationMenuItem?.folderId,
  );
  const selectableItemIds = isAddingToFolder
    ? MAIN_MENU_ITEM_TYPES.filter(
        (type) => type !== NavigationMenuItemType.FOLDER,
      )
    : [...MAIN_MENU_ITEM_TYPES];

  return (
    <SidePanelAddToNavigationDroppable>
      {({ innerRef, droppableProps, placeholder }) => (
        <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={innerRef} {...droppableProps}>
            <SidePanelGroup heading={t`Data`}>
              <SelectableListItem
                itemId={NavigationMenuItemType.OBJECT}
                onEnter={onSelectObject}
              >
                <CommandMenuItem
                  Icon={() => (
                    <NavigationMenuItemStyleIcon
                      Icon={IconBuildingSkyscraper}
                      color="blue"
                    />
                  )}
                  label={t`Object`}
                  id={NavigationMenuItemType.OBJECT}
                  hasSubMenu={true}
                  onClick={onSelectObject}
                />
              </SelectableListItem>
              <SelectableListItem
                itemId={NavigationMenuItemType.VIEW}
                onEnter={onSelectView}
              >
                <CommandMenuItem
                  Icon={() => (
                    <NavigationMenuItemStyleIcon
                      Icon={IconTable}
                      color="gray"
                    />
                  )}
                  label={t`View`}
                  id={NavigationMenuItemType.VIEW}
                  hasSubMenu={true}
                  onClick={onSelectView}
                />
              </SelectableListItem>
              <SelectableListItem
                itemId={NavigationMenuItemType.RECORD}
                onEnter={onSelectRecord}
              >
                <CommandMenuItem
                  Icon={() => (
                    <Avatar
                      placeholder="L"
                      type="rounded"
                      backgroundColor={themeCssVariables.color.green4}
                    />
                  )}
                  label={t`Record`}
                  id={NavigationMenuItemType.RECORD}
                  hasSubMenu={true}
                  onClick={onSelectRecord}
                />
              </SelectableListItem>
            </SidePanelGroup>
            <SidePanelGroup heading={t`Other`}>
              <SelectableListItem
                itemId={NavigationMenuItemType.FOLDER}
                onEnter={isAddingToFolder ? undefined : handleAddFolder}
              >
                <SidePanelItemWithAddToNavigationDrag
                  icon={IconFolder}
                  label={t`Folder`}
                  id={NavigationMenuItemType.FOLDER}
                  onClick={handleAddFolder}
                  dragIndex={3}
                  payload={{
                    type: NavigationMenuItemType.FOLDER,
                    folderId: 'new',
                    name: t`New folder`,
                  }}
                  disabled={isAddingToFolder}
                />
              </SelectableListItem>
              <SelectableListItem
                itemId={NavigationMenuItemType.LINK}
                onEnter={handleAddLink}
              >
                <SidePanelItemWithAddToNavigationDrag
                  icon={IconLink}
                  label={t`Link`}
                  id={NavigationMenuItemType.LINK}
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
            </SidePanelGroup>
            {placeholder}
          </div>
        </SidePanelList>
      )}
    </SidePanelAddToNavigationDroppable>
  );
};
