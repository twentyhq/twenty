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
});
