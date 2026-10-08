import { COMMAND_MENU_SIDE_PANEL_PAGES } from '@/side-panel/constants/CommandMenuSidePanelPages';
import { SIDE_PANEL_DISCARD_CHANGES_DIALOG_ID } from '@/side-panel/constants/SidePanelDiscardChangesDialogId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { sidePanelPageHasUnsavedChangesComponentState } from '@/side-panel/states/sidePanelPageHasUnsavedChangesComponentState';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';

export const useHandleSidePanelEscape = () => {
  const store = useStore();
  const [sidePanelSearch, setSidePanelSearch] =
    useAtomState(sidePanelSearchState);
  const { page: sidePanelPage, instanceId: sidePanelPageInstanceId } =
    useAtomStateValue(sidePanelPageInfoSelector);

  const { goBackOneSubPageOrMainPage } = useSidePanelHistory();
  const { openDialog } = useDialog();

  return () => {
    const canClearSidePanelSearch =
      COMMAND_MENU_SIDE_PANEL_PAGES.includes(sidePanelPage) &&
      isNonEmptyString(sidePanelSearch);

    if (canClearSidePanelSearch) {
      setSidePanelSearch('');
      return;
    }

    const wouldLeavePageWithUnsavedChanges =
      store.get(
        sidePanelPageHasUnsavedChangesComponentState.atomFamily({
          instanceId: sidePanelPageInstanceId,
        }),
      ) &&
      !isNonEmptyArray(
        store.get(
          sidePanelSubPageStackComponentState.atomFamily({
            instanceId: sidePanelPageInstanceId,
          }),
        ),
      );

    if (wouldLeavePageWithUnsavedChanges) {
      openDialog(SIDE_PANEL_DISCARD_CHANGES_DIALOG_ID);
      return;
    }

    goBackOneSubPageOrMainPage();
  };
};
