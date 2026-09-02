import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconTable } from 'twenty-ui/icon';

describe('SidePanelRouter', () => {
  it('does not render page layout information after the main record selection is cleared', () => {
    const store = createStore();

    store.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.DashboardRecordTableSettings,
        pageTitle: 'View',
        pageIcon: IconTable,
        pageId: 'record-table-settings',
      },
    ]);

    expect(() =>
      render(
        <I18nProvider i18n={i18n}>
          <MemoryRouter
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true,
            }}
          >
            <JotaiProvider store={store}>
              <SidePanelRouter />
            </JotaiProvider>
          </MemoryRouter>
        </I18nProvider>,
      ),
    ).not.toThrow();
  });
});
