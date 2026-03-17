import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useDuplicatePageLayoutTab } from '@/page-layout/hooks/useDuplicatePageLayoutTab';
import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { useSetAsPinnedTab } from '@/page-layout/hooks/useSetAsPinnedTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { TAB_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/TabSettingsSelectableItemIds';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCopyPlus,
  IconPinned,
  IconTrash,
} from 'twenty-ui/display';
import { PageLayoutType } from '~/generated-metadata/graphql';

type SidePanelPageLayoutTabSettingsContentProps = {
  pageLayoutId: string;
  recordId: string;
};

export const SidePanelPageLayoutTabSettingsContent = ({
  pageLayoutId,
  recordId,
}: SidePanelPageLayoutTabSettingsContentProps) => {
  const { closeSidePanelMenu } = useSidePanelMenu();

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: pageLayoutDraft.type,
    targetRecordIdentifier: { id: recordId, targetObjectNameSingular: '' },
  });

  const [pageLayoutTabSettingsOpenTabId, setPageLayoutTabSettingsOpenTabId] =
    useAtomComponentState(
      pageLayoutTabSettingsOpenTabIdComponentState,
      pageLayoutId,
    );

  const { moveLeft, moveRight } = useMovePageLayoutTab(pageLayoutId);
  const { deleteTab } = useDeletePageLayoutTab({
    pageLayoutId,
    tabListInstanceId,
  });
  const { duplicateTab } = useDuplicatePageLayoutTab({
    pageLayoutId,
    tabListInstanceId,
  });
  const { setAsPinnedTab } = useSetAsPinnedTab(pageLayoutId);

  if (!isDefined(pageLayoutTabSettingsOpenTabId)) {
    return null;
  }

  const tabsSorted = sortTabsByPosition(pageLayoutDraft.tabs);
  const currentIndex = tabsSorted.findIndex(
    (t) => t.id === pageLayoutTabSettingsOpenTabId,
  );
  if (currentIndex < 0) return null;
  const tab = tabsSorted[currentIndex];
  const isRecordPage = pageLayoutDraft.type === PageLayoutType.RECORD_PAGE;
  const hasPinnedTab = isRecordPage && tabsSorted.length > 1;
  const canMoveLeft = hasPinnedTab ? currentIndex > 1 : currentIndex > 0;
  const canMoveRight = currentIndex < tabsSorted.length - 1;
  const canDelete = tabsSorted.length > 1;
  const isAlreadyPinned = currentIndex === 0;
  const canSetAsPinned =
    isRecordPage && !isAlreadyPinned && tabsSorted.length > 1;

  const handleDelete = () => {
    deleteTab(tab.id);
    setPageLayoutTabSettingsOpenTabId(null);
    closeSidePanelMenu();
  };

  const selectableItemIds = [
    ...(canMoveLeft ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_LEFT] : []),
    ...(canMoveRight ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.MOVE_RIGHT] : []),
    ...(canSetAsPinned ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED] : []),
    TAB_SETTINGS_SELECTABLE_ITEM_IDS.DUPLICATE,
    ...(canDelete ? [TAB_SETTINGS_SELECTABLE_ITEM_IDS.DELETE] : []),
  ];

  return (
    <>
      <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
        <SidePanelGroup heading={t`Settings`}>
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
          {canSetAsPinned && (
            <SelectableListItem
              itemId={TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED}
              onEnter={() => setAsPinnedTab(tab.id)}
            >
              <CommandMenuItem
                id={TAB_SETTINGS_SELECTABLE_ITEM_IDS.SET_AS_PINNED}
                Icon={IconPinned}
                label={t`Set as pinned tab`}
                onClick={() => setAsPinnedTab(tab.id)}
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
        </SidePanelGroup>
      </SidePanelList>
    </>
  );
};
