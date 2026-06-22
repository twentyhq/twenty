import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sanitizeChartFiltersInPageLayoutDraft } from '@/page-layout/utils/sanitizeChartFiltersInPageLayoutDraft';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
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

const buildChartFilters = (recordFilters: ChartFilters['recordFilters']) =>
  ({ recordFilters, recordFilterGroups: [] }) as ChartFilters;

const buildDraft = (widgets: PageLayoutWidget[]): DraftPageLayout => {
  const tab: PageLayoutTab = {
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
    objectMetadataId: TEST_OBJECT_METADATA_ID,
    defaultTabToFocusOnMobileAndSidePanelId: null,
    tabs: [tab],
  };
};

const buildValidFieldsMap = (fieldIds: string[]) =>
  new Map<string, Set<string>>([
    [TEST_OBJECT_METADATA_ID, new Set(fieldIds)],
  ]);

describe('sanitizeChartFiltersInPageLayoutDraft', () => {
  it('should drop chart filter rules that reference deactivated or deleted fields on save', () => {
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: buildChartFilters([
          { id: 'filter-1', fieldMetadataId: ACTIVE_FIELD_ID },
          { id: 'filter-2', fieldMetadataId: DELETED_FIELD_ID },
        ]),
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0]
      .configuration as { filter: ChartFilters };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: ACTIVE_FIELD_ID },
    ]);
  });

  it('should keep chart filters untouched when all referenced fields are still active', () => {
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: buildChartFilters([
          { id: 'filter-1', fieldMetadataId: ACTIVE_FIELD_ID },
        ]),
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0]
      .configuration as { filter: ChartFilters };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: ACTIVE_FIELD_ID },
    ]);
  });

  it('should drop orphaned filter groups left behind once invalid filters are removed', () => {
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: {
          recordFilters: [
            {
              id: 'filter-1',
              fieldMetadataId: DELETED_FIELD_ID,
              recordFilterGroupId: 'root',
            },
          ],
          recordFilterGroups: [
            {
              id: 'root',
              parentRecordFilterGroupId: undefined,
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
          ],
        } as ChartFilters,
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0]
      .configuration as { filter: ChartFilters };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([]);
    expect(sanitizedConfiguration.filter.recordFilterGroups).toEqual([]);
  });

  it('should leave non-chart widgets untouched', () => {
    const widget = createTestWidget({
      id: 'fields-widget',
      configuration: TEST_FIELDS_CONFIGURATION,
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    expect(result.tabs[0].widgets[0].configuration).toEqual(
      TEST_FIELDS_CONFIGURATION,
    );
  });

  it('should leave chart filters untouched when the object metadata cannot be resolved', () => {
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: buildChartFilters([
          { id: 'filter-1', fieldMetadataId: DELETED_FIELD_ID },
        ]),
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: new Map(),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0]
      .configuration as { filter: ChartFilters };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: DELETED_FIELD_ID },
    ]);
  });
});
