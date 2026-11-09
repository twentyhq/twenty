import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { dropDashboardFilterOverridesToMissingFields } from '@/page-layout/utils/dropDashboardFilterOverridesToMissingFields';
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

const DATE_RANGE_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01',
  fieldMetadataId: EXISTING_FIELD_ID,
};

const CLOSE_DATE_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e02',
  fieldMetadataId: DELETED_FIELD_ID,
};

const NOT_APPLIED_BINDING: DashboardFilterBinding = {
  __typename: 'DashboardFilterBinding',
  pageLayoutFilterId: '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e03',
  fieldMetadataId: null,
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

const dropOverrides = (widget: PageLayoutWidget) =>
  dropDashboardFilterOverridesToMissingFields({
    pageLayoutDraft: buildDraft([widget]),
    fieldMetadataItemsByObjectMetadataId: new Map([
      [TEST_OBJECT_METADATA_ID, [{ id: EXISTING_FIELD_ID }]],
    ]),
  }).tabs[0].widgets[0];

describe('dropDashboardFilterOverridesToMissingFields', () => {
  it('should drop the bindings of a chart to fields that no longer exist and keep its exclusions', () => {
    const widgetAfterSave = dropOverrides(
      createTestWidget({
        configuration: {
          ...TEST_BAR_CHART_CONFIGURATION,
          dashboardFilterBindings: [
            DATE_RANGE_BINDING,
            CLOSE_DATE_BINDING,
            NOT_APPLIED_BINDING,
          ],
        },
      }),
    );

    expect(widgetAfterSave.configuration).toMatchObject({
      dashboardFilterBindings: [DATE_RANGE_BINDING, NOT_APPLIED_BINDING],
    });
  });

  it('should drop the bindings of a record table to fields that no longer exist', () => {
    const widgetAfterSave = dropOverrides(
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

    expect(widgetAfterSave.configuration).toMatchObject({
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

    expect(dropOverrides(widget)).toBe(widget);
  });

  it('should leave a widget without bindings alone', () => {
    const widget = createTestWidget();

    expect(dropOverrides(widget)).toBe(widget);
  });
});
