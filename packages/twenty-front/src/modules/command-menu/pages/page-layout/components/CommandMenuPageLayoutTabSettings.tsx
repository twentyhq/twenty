import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/command-menu/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
} from 'twenty-ui/display';

export const CommandMenuPageLayoutTabSettings = () => {
  const theme = useTheme();
  const { closeCommandMenu } = useCommandMenu();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const draft = useRecoilComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const [openTabId, setOpenTabId] = useRecoilComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { moveLeft, moveRight } = useMovePageLayoutTab(pageLayoutId);
  const { deleteTab } = useDeletePageLayoutTab(pageLayoutId);
  const { updatePageLayoutTab } = useUpdatePageLayoutTab(pageLayoutId);

  if (!isDefined(openTabId)) {
    return null;
  }

  const tabsSorted = sortTabsByPosition(draft.tabs);
  const currentIndex = tabsSorted.findIndex((t) => t.id === openTabId);
  if (currentIndex < 0) return null;
  const tab = tabsSorted[currentIndex];
  const disableMoveLeft = currentIndex <= 0;
  const disableMoveRight = currentIndex >= tabsSorted.length - 1;
  const disableDelete = tabsSorted.length <= 1;

  const handleDelete = () => {
    if (!disableDelete) {
      deleteTab(tab.id);
      setOpenTabId(null);
      closeCommandMenu();
    }
  };

  return (
    <>
      <SidePanelHeader
        Icon={IconAppWindow}
        iconColor={theme.font.color.tertiary}
        initialTitle={tab.title}
        headerType={t`Tab`}
        onTitleChange={(newTitle) => {
          if (isDefined(newTitle) && isNonEmptyString(newTitle)) {
            updatePageLayoutTab(tab.id, { title: newTitle });
          }
        }}
      />
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={Object.values(TAB_SETTINGS_SELECTABLE_ITEM_IDS)}
      >
        <CommandGroup heading={t`Settings`}>
          <SelectableListItem
            itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT}
            onEnter={() => moveLeft(tab.id)}
          >
            <CommandMenuItem
              id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT}
              Icon={IconChevronLeft}
              label={t`Move left`}
              onClick={() => moveLeft(tab.id)}
              disabled={disableMoveLeft}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT}
            onEnter={() => moveRight(tab.id)}
          >
            <CommandMenuItem
              id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT}
              Icon={IconChevronRight}
              label={t`Move right`}
              onClick={() => moveRight(tab.id)}
              disabled={disableMoveRight}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
            onEnter={handleDelete}
          >
            <CommandMenuItem
              id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
              Icon={IconTrash}
              label={t`Delete`}
              onClick={handleDelete}
              disabled={disableDelete}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    </>
  );
};
