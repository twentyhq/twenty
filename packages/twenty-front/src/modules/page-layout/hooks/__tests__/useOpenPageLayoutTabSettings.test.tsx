import { useOpenPageLayoutTabSettings } from '@/page-layout/hooks/useOpenPageLayoutTabSettings';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const mockNavigatePageLayoutSidePanel = jest.fn();

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

describe('useOpenPageLayoutTabSettings', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it.each([false, true])(
    'opens the requested tab settings when interrupting a closing panel: %s',
    (isPanelClosing) => {
      const store = createStore();
      const settingsTabAtom =
        pageLayoutTabSettingsOpenTabIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
          surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        });
      store.set(settingsTabAtom, isPanelClosing ? 'previous-tab' : null);

      if (isPanelClosing) {
        mockNavigatePageLayoutSidePanel.mockImplementation(() => {
          store.set(settingsTabAtom, null);
        });
      }

      const { result } = renderHook(() => useOpenPageLayoutTabSettings(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      });

      act(() => result.current.openTabSettings('selected-tab'));

      expect(store.get(settingsTabAtom)).toBe('selected-tab');
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        resetNavigationStack: true,
      });
    },
  );
});
