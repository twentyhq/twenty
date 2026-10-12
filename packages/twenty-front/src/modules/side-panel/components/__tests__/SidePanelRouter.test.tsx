import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type getDefaultStore } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SidePanelPages } from 'twenty-shared/types';
import { IconTable } from 'twenty-ui/icon';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// The full page configs pull in the BlockNote editor, which jest cannot parse
jest.mock('@/side-panel/constants/SidePanelPagesConfig', () => {
  const { SidePanelPages: Pages } = jest.requireActual('twenty-shared/types');
  const { SidePanelDashboardRecordTableSettings } = jest.requireActual(
    '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings',
  );

  return {
    SIDE_PANEL_PAGES_CONFIG: new Map([
      [
        Pages.DashboardRecordTableSettings,
        <SidePanelDashboardRecordTableSettings />,
      ],
    ]),
  };
});

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormRecordRichTextFieldInput',
  () => ({ FormRecordRichTextFieldInput: () => null }),
);

const DASHBOARD_PAGE_LAYOUT_ID = 'dashboard-page-layout-id';
const SIDE_PANEL_PAGE_ID = 'record-table-settings-page-id';

const recordTableWidget = {
  ...makeWidget('record-table-widget', 0),
  title: 'Open deals',
  type: WidgetType.RECORD_TABLE,
  configuration: {
    __typename: 'RecordTableConfiguration' as const,
    configurationType: WidgetConfigurationType.RECORD_TABLE,
  },
};

// Leaving the dashboard resets the main context store selection while the
// side panel is still animating closed with its navigation stack intact
const initializeStoreAfterLeavingDashboard = (
  store: ReturnType<typeof getDefaultStore>,
) => {
  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: DASHBOARD_PAGE_LAYOUT_ID,
    }),
    {
      ...makeDraft([makeTab('tab-1', [recordTableWidget])]),
      id: DASHBOARD_PAGE_LAYOUT_ID,
      type: PageLayoutType.DASHBOARD,
    },
  );
  store.set(
    pageLayoutEditingWidgetIdComponentState.atomFamily({
      instanceId: DASHBOARD_PAGE_LAYOUT_ID,
    }),
    recordTableWidget.id,
  );
  store.set(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    getMockObjectMetadataItemOrThrow('company').id,
  );
  store.set(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    { mode: 'selection', selectedRecordIds: [] },
  );
  store.set(isSidePanelOpenedState.atom, false);
  store.set(sidePanelNavigationStackState.atom, [
    {
      page: SidePanelPages.DashboardRecordTableSettings,
      pageTitle: 'Edit Record Table',
      pageIcon: IconTable,
      pageId: SIDE_PANEL_PAGE_ID,
      pageLayoutSidePanelTarget: {
        pageLayoutId: DASHBOARD_PAGE_LAYOUT_ID,
        targetRecordIdentifier: {
          id: 'dashboard-record-id',
          targetObjectNameSingular: 'dashboard',
        },
      },
    },
  ]);
};

const renderSidePanelRouter = (
  onInitializeJotaiStore: (store: ReturnType<typeof getDefaultStore>) => void,
) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore,
  });

  render(
    <Wrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SidePanelRouter />
        </MemoryRouter>
      </I18nProvider>
    </Wrapper>,
  );
};

describe('SidePanelRouter', () => {
  it('should keep showing a page layout page once the page behind it no longer targets its record', () => {
    renderSidePanelRouter(initializeStoreAfterLeavingDashboard);

    expect(screen.getByText('Open deals')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  it('should keep showing a page layout sub page once the page behind it no longer targets its record', () => {
    renderSidePanelRouter((store) => {
      initializeStoreAfterLeavingDashboard(store);
      store.set(
        sidePanelSubPageStackComponentState.atomFamily({
          instanceId: SIDE_PANEL_PAGE_ID,
        }),
        [
          {
            id: 'filter-sub-page-id',
            subPage: SidePanelSubPages.PageLayoutRecordTableFilter,
            title: 'Filters',
          },
        ],
      );
    });

    expect(screen.getByText('Open deals')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });
});
