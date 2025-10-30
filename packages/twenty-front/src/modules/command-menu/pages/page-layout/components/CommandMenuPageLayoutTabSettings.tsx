import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { SidePanelHeader } from '@/command-menu/components/SidePanelHeader';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useDeletePageLayoutTab } from '@/page-layout/hooks/useDeletePageLayoutTab';
import { useMovePageLayoutTab } from '@/page-layout/hooks/useMovePageLayoutTab';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
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

  const tabsSorted = [...draft.tabs].sort((a, b) => a.position - b.position);
  const currentIndex = tabsSorted.findIndex((t) => t.id === openTabId);
  if (currentIndex < 0) return null;
  const tab = tabsSorted[currentIndex];
  const disableMoveLeft = currentIndex <= 0;
  const disableMoveRight = currentIndex >= tabsSorted.length - 1;
  const disableDelete = tabsSorted.length <= 1;

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
        selectableItemIds={['tab-move-left', 'tab-move-right', 'tab-delete']}
      >
        <CommandGroup heading={t`Settings`}>
          <SelectableListItem
            itemId="tab-move-left"
            onEnter={() => moveLeft(tab.id)}
          >
            <CommandMenuItem
              id="tab-move-left"
              Icon={IconChevronLeft}
              label={t`Move left`}
              onClick={() => moveLeft(tab.id)}
              disabled={disableMoveLeft}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="tab-move-right"
            onEnter={() => moveRight(tab.id)}
          >
            <CommandMenuItem
              id="tab-move-right"
              Icon={IconChevronRight}
              label={t`Move right`}
              onClick={() => moveRight(tab.id)}
              disabled={disableMoveRight}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="tab-delete"
            onEnter={() => {
              if (!disableDelete) {
                deleteTab(tab.id);
                setOpenTabId(null);
                closeCommandMenu();
              }
            }}
          >
            <CommandMenuItem
              id="tab-delete"
              Icon={IconTrash}
              label={t`Delete`}
              onClick={() => {
                if (!disableDelete) {
                  deleteTab(tab.id);
                  setOpenTabId(null);
                  closeCommandMenu();
                }
              }}
              disabled={disableDelete}
            />
          </SelectableListItem>
        </CommandGroup>
      </CommandMenuList>
    </>
  );
};
