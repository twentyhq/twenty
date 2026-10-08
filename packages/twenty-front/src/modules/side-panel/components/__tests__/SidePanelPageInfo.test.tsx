import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { SidePanelPageInfo } from '@/side-panel/components/SidePanelPageInfo';
import { SidePanelPages } from 'twenty-shared/types';
import { IconChartPie } from 'twenty-ui/icon';

describe('SidePanelPageInfo', () => {
  // The side panel still renders its last page while it animates closed,
  // after leaving the dashboard has already cleared the selection
  it('shows the page title for a page layout page once its record is no longer selected', () => {
    const store = createStore();

    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      'company-object-id',
    );

    render(
      <JotaiProvider store={store}>
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
        >
          <SidePanelPageInfo
            pageChip={{
              Icons: [],
              text: 'Chart',
              page: {
                page: SidePanelPages.DashboardChartSettings,
                pageTitle: 'Chart',
                pageIcon: IconChartPie,
                pageId: 'chart-settings-page-id',
              },
            }}
          />
        </ContextStoreComponentInstanceContext.Provider>
      </JotaiProvider>,
    );

    expect(screen.getByText('Chart')).toBeInTheDocument();
  });
});
