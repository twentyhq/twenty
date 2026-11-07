import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sanitizeDashboardFilterBindingsInPageLayoutDraft } from '@/page-layout/utils/sanitizeDashboardFilterBindingsInPageLayoutDraft';
import {
  type DashboardFilterBinding,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
  TEST_OBJECT_METADATA_ID,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const EXISTING_FIELD_ID = TEST_FIELD_METADATA_ID_1;
const DELETED_FIELD_ID = TEST_FIELD_METADATA_ID_2;

const PERIOD_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  fieldMetadataId: EXISTING_FIELD_ID,
};

const CLOSE_DATE_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  fieldMetadataId: DELETED_FIELD_ID,
};

const buildDraft = (widgets: PageLayoutWidget[]): DraftPageLayout => ({
  id: 'page-layout-1',
  name: 'Test Dashboard',
  type: PageLayoutType.DASHBOARD,
  isFirstTabPinned: true,
  objectMetadataId: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
  tabs: [
    {
      __typename: 'PageLayoutTab',
      isSystemSideEffect: false,
      universalIdentifier: 'universal-identifier-mock',
      id: 'tab-1',
      applicationId: 'test-application-id',
      title: 'Tab 1',
      position: 0,
      pageLayoutId: 'page-layout-1',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      widgets,
    },
  ],
});

const sanitizeWidget = (widget: PageLayoutWidget) =>
  sanitizeDashboardFilterBindingsInPageLayoutDraft({
    pageLayoutDraft: buildDraft([widget]),
    fieldMetadataItemsByObjectMetadataId: new Map([
      [TEST_OBJECT_METADATA_ID, [{ id: EXISTING_FIELD_ID }]],
    ]),
  }).tabs[0].widgets[0];

describe('sanitizeDashboardFilterBindingsInPageLayoutDraft', () => {
  it('should drop the bindings of a chart to fields that no longer exist', () => {
    const sanitizedWidget = sanitizeWidget(
      createTestWidget({
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          dashboardFilterBindings: [PERIOD_BINDING, CLOSE_DATE_BINDING],
        },
      }),
    );

    expect(sanitizedWidget.configuration).toMatchObject({
      dashboardFilterBindings: [PERIOD_BINDING],
    });
  });

  it('should drop the bindings of a record table to fields that no longer exist', () => {
    const sanitizedWidget = sanitizeWidget(
      createTestWidget({
        type: WidgetType.RECORD_TABLE,
        configuration: {
          __typename: 'RecordTableConfiguration',
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          viewId: null,
          dashboardFilterBindings: [CLOSE_DATE_BINDING],
        },
      }),
    );

    expect(sanitizedWidget.configuration).toMatchObject({
      dashboardFilterBindings: [],
    });
  });

  it('should leave a widget alone when the fields of its object are unknown', () => {
    const widget = createTestWidget({
      objectMetadataId: 'unknown-object-metadata-id',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: [CLOSE_DATE_BINDING],
      },
    });

    expect(sanitizeWidget(widget)).toBe(widget);
  });

  it('should leave a widget without bindings alone', () => {
    const widget = createTestWidget();

    expect(sanitizeWidget(widget)).toBe(widget);
  });
});
