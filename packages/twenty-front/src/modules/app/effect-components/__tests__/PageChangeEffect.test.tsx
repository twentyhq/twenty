import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSettings } from 'twenty-ui/icon';

import { PageChangeEffect } from '@/app/effect-components/PageChangeEffect';
import { WorkspaceRouteObjectsContext } from '@/app/routing/components/WorkspaceRouteObjectsProvider';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import {
  type SidePanelNavigationStackItem,
  sidePanelNavigationStackState,
} from '@/side-panel/states/sidePanelNavigationStackState';
import { PageFocusId } from '@/types/PageFocusId';
import { currentGlobalHotkeysConfigSelector } from '@/ui/utilities/focus/states/currentGlobalHotkeysConfigSelector';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@/app/hooks/usePageChangeEffectNavigateLocation', () => ({
  usePageChangeEffectNavigateLocation: () => undefined,
}));

const WIDGET_SETTINGS_PAGE: SidePanelNavigationStackItem = {
  page: SidePanelPages.PageLayoutWidgetSettings,
  pageTitle: 'Widget',
  pageIcon: IconSettings,
  pageId: 'widget-settings-page-id',
  pageLayoutSidePanelTarget: {
    pageLayoutId: 'company-page-layout-id',
    targetRecordIdentifier: {
      id: 'company-record-id',
      targetObjectNameSingular: 'company',
    },
  },
};

const RECORD_PAGE: SidePanelNavigationStackItem = {
  page: SidePanelPages.RoutedPage,
  pageTitle: 'Person',
  pageIcon: IconSettings,
  pageId: 'record-page-id',
  routedLocation: {
    pathname: '/object/person/person-record-id',
    search: '',
    hash: '',
    state: null,
    key: 'record-page',
  },
};

let navigateMainPage: ((path: string) => void) | undefined;

const MainPageNavigatorEffect = () => {
  const navigate = useNavigate();

  navigateMainPage = navigate;

  return null;
};

const renderPageChangeEffect = () => {
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/object/company/company-record-id']}>
          <WorkspaceRouteObjectsContext.Provider value={[]}>
            {children}
            <MainPageNavigatorEffect />
          </WorkspaceRouteObjectsContext.Provider>
        </MemoryRouter>
      </I18nProvider>
    </BaseWrapper>
  );

  render(<PageChangeEffect />, { wrapper });
};

const openSidePanelWith = (
  sidePanelNavigationStack: SidePanelNavigationStackItem[],
) => {
  act(() => {
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(
      sidePanelNavigationStackState.atom,
      sidePanelNavigationStack,
    );
  });
};

describe('PageChangeEffect', () => {
  it('should close a page layout page when leaving the page it edits', async () => {
    renderPageChangeEffect();
    openSidePanelWith([WIDGET_SETTINGS_PAGE]);

    act(() => navigateMainPage?.('/objects/people'));

    await waitFor(() => {
      expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(false);
    });
  });

  it('should drop page layout pages from a panel that stays open when leaving the page they edit', async () => {
    renderPageChangeEffect();
    openSidePanelWith([WIDGET_SETTINGS_PAGE, RECORD_PAGE]);

    act(() => navigateMainPage?.('/objects/people'));

    await waitFor(() => {
      expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
        RECORD_PAGE,
      ]);
    });
    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
  });

  it('should let the inbox use global hotkeys when coming from settings', async () => {
    renderPageChangeEffect();

    act(() => navigateMainPage?.('/settings/profile'));
    await waitFor(() => {
      expect(
        jotaiStore.get(currentGlobalHotkeysConfigSelector.atom)
          .enableGlobalHotkeysConflictingWithKeyboard,
      ).toBe(false);
    });

    act(() => navigateMainPage?.('/inbox'));

    await waitFor(() => {
      expect(jotaiStore.get(focusStackState.atom).at(-1)?.focusId).toBe(
        PageFocusId.AiChatInbox,
      );
    });
    expect(
      jotaiStore.get(currentGlobalHotkeysConfigSelector.atom)
        .enableGlobalHotkeysConflictingWithKeyboard,
    ).toBe(true);
  });

  it('should keep what is focused over the inbox when moving between chats', async () => {
    renderPageChangeEffect();

    act(() => navigateMainPage?.('/inbox'));
    await waitFor(() => {
      expect(jotaiStore.get(focusStackState.atom).at(-1)?.focusId).toBe(
        PageFocusId.AiChatInbox,
      );
    });

    act(() => {
      jotaiStore.set(focusStackState.atom, [
        ...jotaiStore.get(focusStackState.atom),
        {
          focusId: 'chat-menu',
          componentInstance: {
            componentType: FocusComponentType.DROPDOWN,
            componentInstanceId: 'chat-menu',
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysWithModifiers: true,
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        },
      ]);
    });
    act(() =>
      navigateMainPage?.('/inbox/6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60'),
    );

    await waitFor(() => {
      expect(jotaiStore.get(focusStackState.atom).at(-1)?.focusId).toBe(
        'chat-menu',
      );
    });
  });

  it('should give the inbox global hotkeys back once a panel kept open from settings closes', async () => {
    renderPageChangeEffect();

    act(() => navigateMainPage?.('/settings/profile'));
    await waitFor(() => {
      expect(jotaiStore.get(focusStackState.atom).at(-1)?.focusId).toBe(
        PageFocusId.Settings,
      );
    });

    const sidePanelFocusStackItem = {
      focusId: 'side-panel',
      componentInstance: {
        componentType: FocusComponentType.SIDE_PANEL,
        componentInstanceId: 'side-panel',
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysWithModifiers: true,
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    };

    openSidePanelWith([RECORD_PAGE]);
    act(() => {
      jotaiStore.set(focusStackState.atom, [
        ...jotaiStore.get(focusStackState.atom),
        sidePanelFocusStackItem,
      ]);
    });
    act(() => navigateMainPage?.('/inbox'));

    await waitFor(() => {
      expect(
        jotaiStore.get(focusStackState.atom).map(({ focusId }) => focusId),
      ).toEqual([PageFocusId.AiChatInbox, 'side-panel']);
    });

    act(() => {
      jotaiStore.set(
        focusStackState.atom,
        jotaiStore
          .get(focusStackState.atom)
          .filter(({ focusId }) => focusId !== 'side-panel'),
      );
    });

    expect(
      jotaiStore.get(currentGlobalHotkeysConfigSelector.atom)
        .enableGlobalHotkeysConflictingWithKeyboard,
    ).toBe(true);
  });
});
