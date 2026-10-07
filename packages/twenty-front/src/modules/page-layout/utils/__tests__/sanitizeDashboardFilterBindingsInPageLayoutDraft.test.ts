import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sanitizeDashboardFilterBindingsInPageLayoutDraft } from '@/page-layout/utils/sanitizeDashboardFilterBindingsInPageLayoutDraft';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELDS_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
  TEST_OBJECT_METADATA_ID,
  createTestWidget,
} from '~/testing/mock-data/widget-configurations';

const ACTIVE_FIELD_ID = TEST_FIELD_METADATA_ID_1;
const DELETED_FIELD_ID = TEST_FIELD_METADATA_ID_2;

const buildDraft = (widgets: PageLayoutWidget[]): DraftPageLayout => {
  const tab: PageLayoutTab = {
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutTab',
    id: 'tab-1',
    applicationId: 'test-application-id',
    title: 'Tab 1',
    position: 0,
    pageLayoutId: 'page-layout-1',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    widgets,
  };

  return {
    id: 'page-layout-1',
    name: 'Test Page Layout',
    type: PageLayoutType.DASHBOARD,
    isFirstTabPinned: true,
    objectMetadataId: TEST_OBJECT_METADATA_ID,
    defaultTabToFocusOnMobileAndSidePanelId: null,
    dashboardFilters: null,
    tabs: [tab],
  };
};

const buildValidFieldsMap = (fieldIds: string[]) =>
  new Map<string, Set<string>>([[TEST_OBJECT_METADATA_ID, new Set(fieldIds)]]);

const getBindings = (result: DraftPageLayout) =>
  (
    result.tabs[0].widgets[0].configuration as {
      dashboardFilterBindings?: Record<string, DashboardFilterBinding | null>;
    }
  ).dashboardFilterBindings;

describe('sanitizeDashboardFilterBindingsInPageLayoutDraft', () => {
  it('should drop bindings whose field no longer exists on the widget object and keep null bindings', () => {
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings: {
          date: { fieldMetadataId: ACTIVE_FIELD_ID },
          owner: { fieldMetadataId: DELETED_FIELD_ID },
          unapplied: null,
        },
      },
    });

    const result = sanitizeDashboardFilterBindingsInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    expect(getBindings(result)).toEqual({
      date: { fieldMetadataId: ACTIVE_FIELD_ID },
      unapplied: null,
    });
  });

  it('should keep bindings untouched when every bound field is still active', () => {
    const dashboardFilterBindings = {
      date: { fieldMetadataId: ACTIVE_FIELD_ID },
    };
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings,
      },
    });

    const result = sanitizeDashboardFilterBindingsInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    expect(getBindings(result)).toEqual(dashboardFilterBindings);
  });

  it('should leave chart widgets without bindings and non-chart widgets untouched', () => {
    const chartWidget = createTestWidget({
      id: 'chart-widget',
      configuration: TEST_BAR_CHART_CONFIGURATION,
    });
    const fieldsWidget = createTestWidget({
      id: 'fields-widget',
      configuration: TEST_FIELDS_CONFIGURATION,
    });

    const result = sanitizeDashboardFilterBindingsInPageLayoutDraft({
      pageLayoutDraft: buildDraft([chartWidget, fieldsWidget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    expect(result.tabs[0].widgets[0].configuration).toEqual(
      TEST_BAR_CHART_CONFIGURATION,
    );
    expect(result.tabs[0].widgets[1].configuration).toEqual(
      TEST_FIELDS_CONFIGURATION,
    );
  });

  it('should leave bindings untouched when the object metadata cannot be resolved', () => {
    const dashboardFilterBindings = {
      owner: { fieldMetadataId: DELETED_FIELD_ID },
    };
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        dashboardFilterBindings,
      },
    });

    const result = sanitizeDashboardFilterBindingsInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: new Map(),
    });

    expect(getBindings(result)).toEqual(dashboardFilterBindings);
  });
});
