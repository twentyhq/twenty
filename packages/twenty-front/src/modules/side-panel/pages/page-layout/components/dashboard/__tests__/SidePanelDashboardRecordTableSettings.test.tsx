import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { SidePanelDashboardRecordTableSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { PageLayoutType } from '~/generated-metadata/graphql';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const PAGE_LAYOUT_ID = 'dashboard-page-layout-id';

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldCallbacks',
  () => ({
    useRecordTableWidgetFieldCallbacks: () => ({
      handleFieldUpdated: jest.fn(),
      handleFieldCreated: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetLayoutCallbacks',
  () => ({
    useRecordTableWidgetLayoutCallbacks: () => ({
      handleShouldHideEmptyGroupsChange: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewForDisplay',
  () => ({
    useRecordTableWidgetViewForDisplay: () => ({ view: undefined }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelSubPageHistory', () => ({
  useSidePanelSubPageHistory: () => ({
    navigateToSidePanelSubPage: jest.fn(),
  }),
}));

jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
  () => ({
    usePageLayoutIdFromContextStore: () => ({ pageLayoutId: PAGE_LAYOUT_ID }),
  }),
);

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useRecordTableSettingsDescriptions',
  () => ({
    useRecordTableSettingsDescriptions: () => ({
      sourceDescription: '',
      fieldsDescription: '',
      filterDescription: '',
      sortDescription: '',
    }),
  }),
);

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig',
  () => ({
    useUpdateCurrentWidgetConfig: () => ({
      updateCurrentWidgetConfig: jest.fn(),
    }),
  }),
);

jest.mock('@/side-panel/pages/page-layout/hooks/useWidgetInEditMode', () => ({
  useWidgetInEditMode: () => ({ widgetInEditMode: undefined }),
}));

describe('SidePanelDashboardRecordTableSettings', () => {
  it('reads the dashboard draft without a page layout component context', () => {
    const store = createStore();

    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      {
        id: PAGE_LAYOUT_ID,
        name: 'Dashboard layout',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [],
        defaultTabToFocusOnMobileAndSidePanelId: null,
        isFirstTabPinned: true,
      },
    );

    const { container } = render(
      <JotaiProvider store={store}>
        <I18nProvider i18n={i18n}>
          <SidePanelDashboardRecordTableSettings />
        </I18nProvider>
      </JotaiProvider>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
