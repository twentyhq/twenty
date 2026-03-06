import { useLingui } from '@lingui/react/macro';
import {
  Avatar,
  IconBuildingSkyscraper,
  IconFolder,
  IconLink,
  IconTable,
} from 'twenty-ui/display';

import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelAddToNavigationDraggablePlaceholder } from '@/side-panel/components/SidePanelAddToNavigationDraggablePlaceholder';
import { SidePanelAddToNavigationDroppable } from '@/side-panel/components/SidePanelAddToNavigationDroppable';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useAddFolderToNavigationMenu } from '@/side-panel/pages/navigation-menu-item/hooks/useAddFolderToNavigationMenu';
import { useAddLinkToNavigationMenu } from '@/side-panel/pages/navigation-menu-item/hooks/useAddLinkToNavigationMenu';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

type SidePanelNewSidebarItemMainMenuProps = {
  onSelectObject: () => void;
  onSelectView: () => void;
  onSelectRecord: () => void;
};

export const SidePanelNewSidebarItemMainMenu = ({
  onSelectObject,
  onSelectView,
  onSelectRecord,
}: SidePanelNewSidebarItemMainMenuProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { handleAddFolder } = useAddFolderToNavigationMenu();
  const { handleAddLink } = useAddLinkToNavigationMenu();

  return (
    <SidePanelAddToNavigationDroppable>
      {({ innerRef, droppableProps, placeholder }) => (
        <SidePanelList
          commandGroups={[]}
          selectableItemIds={['object', 'view', 'record', 'folder', 'link']}
        >
          {/* oxlint-disable-next-line react/jsx-props-no-spreading */}
          <div ref={innerRef} {...droppableProps}>
            <SidePanelGroup heading={t`Data`}>
              <SidePanelAddToNavigationDraggablePlaceholder index={0}>
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
              </SidePanelAddToNavigationDraggablePlaceholder>
              <SidePanelAddToNavigationDraggablePlaceholder index={1}>
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
              </SidePanelAddToNavigationDraggablePlaceholder>
              <SidePanelAddToNavigationDraggablePlaceholder index={2}>
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
              </SidePanelAddToNavigationDraggablePlaceholder>
            </SidePanelGroup>
            <SidePanelGroup heading={t`Other`}>
              <SelectableListItem itemId="folder" onEnter={handleAddFolder}>
                <SidePanelItemWithAddToNavigationDrag
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
                <SidePanelItemWithAddToNavigationDrag
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
            </SidePanelGroup>
            {placeholder}
          </div>
        </SidePanelList>
      )}
    </SidePanelAddToNavigationDroppable>
  );
};
