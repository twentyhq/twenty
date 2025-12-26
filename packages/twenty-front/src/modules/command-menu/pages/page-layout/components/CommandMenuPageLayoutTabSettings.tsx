import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/command-menu/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useDuplicatePageLayoutTab } from '@/page-layout/hooks/useDuplicatePageLayoutTab';
import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCopyPlus,
  IconTrash,
} from 'twenty-ui/display';

export const CommandMenuPageLayoutTabSettings = () => {
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
  const { duplicateTab } = useDuplicatePageLayoutTab(pageLayoutId);

  if (!isDefined(openTabId)) {
    return null;
  }

  const tabsSorted = sortTabsByPosition(draft.tabs);
  const currentIndex = tabsSorted.findIndex((t) => t.id === openTabId);
  if (currentIndex < 0) return null;
  const tab = tabsSorted[currentIndex];
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < tabsSorted.length - 1;
  const canDelete = tabsSorted.length > 1;

  const handleDelete = () => {
    deleteTab(tab.id);
    setOpenTabId(null);
    closeCommandMenu();
  };

  const selectableItemIds = [
    ...(canMoveLeft ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT] : []),
    ...(canMoveRight ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT] : []),
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE,
    ...(canDelete ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE] : []),
  ];

  return (
    <>
      <CommandMenuList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <CommandGroup heading={t`Settings`}>
          {canMoveLeft && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT}
              onEnter={() => moveLeft(tab.id)}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT}
                Icon={IconChevronLeft}
                label={t`Move left`}
                onClick={() => moveLeft(tab.id)}
              />
            </SelectableListItem>
          )}
          {canMoveRight && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT}
              onEnter={() => moveRight(tab.id)}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT}
                Icon={IconChevronRight}
                label={t`Move right`}
                onClick={() => moveRight(tab.id)}
              />
            </SelectableListItem>
          )}
          <SelectableListItem
            itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE}
            onEnter={() => duplicateTab(tab.id)}
          >
            <CommandMenuItem
              id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE}
              Icon={IconCopyPlus}
              label={t`Duplicate`}
              onClick={() => duplicateTab(tab.id)}
            />
          </SelectableListItem>
          {canDelete && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
              onEnter={handleDelete}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE}
                Icon={IconTrash}
                label={t`Delete`}
                onClick={handleDelete}
              />
            </SelectableListItem>
          )}
        </CommandGroup>
      </CommandMenuList>
    </>
  );
};
