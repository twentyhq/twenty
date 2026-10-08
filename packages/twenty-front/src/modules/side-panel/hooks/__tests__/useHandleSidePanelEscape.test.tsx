import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconList, IconPlus } from 'twenty-ui/icon';

import { SIDE_PANEL_DISCARD_CHANGES_DIALOG_ID } from '@/side-panel/constants/SidePanelDiscardChangesDialogId';
import { useHandleSidePanelEscape } from '@/side-panel/hooks/useHandleSidePanelEscape';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelPageHasUnsavedChangesComponentState } from '@/side-panel/states/sidePanelPageHasUnsavedChangesComponentState';
import { isDialogOpenedComponentState } from '@/ui/layout/dialog/states/isDialogOpenedComponentState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MemoryRouter>{children}</MemoryRouter>
  </JotaiProvider>
);

const renderHooks = () =>
  renderHook(
    () => ({
      sidePanelMenu: useSidePanelMenu(),
      handleSidePanelEscape: useHandleSidePanelEscape(),
    }),
    { wrapper: Wrapper },
  );

const openCreationFormOverRecordPage = (
  navigateSidePanelMenu: ReturnType<
    typeof useSidePanelMenu
  >['navigateSidePanelMenu'],
) => {
  navigateSidePanelMenu({
    page: SidePanelPages.ViewRecord,
    pageTitle: 'Company',
    pageIcon: IconList,
    pageId: 'record-page',
  });
  navigateSidePanelMenu({
    page: SidePanelPages.RecordCreationForm,
    pageTitle: 'Create Company',
    pageIcon: IconPlus,
    pageId: 'creation-form-page',
  });
};

const getNavigationPageIds = () =>
  jotaiStore
    .get(sidePanelNavigationStackState.atom)
    .map((navigationItem) => navigationItem.pageId);

const isDiscardChangesDialogOpened = () =>
  jotaiStore.get(
    isDialogOpenedComponentState.atomFamily({
      instanceId: SIDE_PANEL_DISCARD_CHANGES_DIALOG_ID,
    }),
  );

describe('useHandleSidePanelEscape', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should go back when the page has no unsaved changes', () => {
    const { result } = renderHooks();

    act(() => {
      openCreationFormOverRecordPage(
        result.current.sidePanelMenu.navigateSidePanelMenu,
      );
    });

    act(() => {
      result.current.handleSidePanelEscape();
    });

    expect(getNavigationPageIds()).toEqual(['record-page']);
    expect(isDiscardChangesDialogOpened()).toBe(false);
  });

  it('should ask before discarding a page with unsaved changes', () => {
    const { result } = renderHooks();

    act(() => {
      openCreationFormOverRecordPage(
        result.current.sidePanelMenu.navigateSidePanelMenu,
      );
      jotaiStore.set(
        sidePanelPageHasUnsavedChangesComponentState.atomFamily({
          instanceId: 'creation-form-page',
        }),
        true,
      );
    });

    act(() => {
      result.current.handleSidePanelEscape();
    });

    expect(getNavigationPageIds()).toEqual([
      'record-page',
      'creation-form-page',
    ]);
    expect(isDiscardChangesDialogOpened()).toBe(true);
  });
});
