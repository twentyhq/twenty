import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sanitizeChartFiltersInPageLayoutDraft } from '@/page-layout/utils/sanitizeChartFiltersInPageLayoutDraft';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { RecordFilterGroupLogicalOperator, ViewFilterOperand } from 'twenty-shared/types';
import { FieldMetadataType, PageLayoutType } from '~/generated-metadata/graphql';
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

const buildRecordFilter = (
  overrides: Partial<RecordFilter> &
    Pick<RecordFilter, 'id' | 'fieldMetadataId'>,
): RecordFilter => ({
  value: '',
  displayValue: '',
  type: FieldMetadataType.NUMBER,
  operand: ViewFilterOperand.IS,
  label: 'Filter',
  ...overrides,
});

const buildChartFilters = (recordFilters: RecordFilter[]): ChartFilters => ({
  recordFilters,
  recordFilterGroups: [],
});

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
  new Map<string, Set<string>>([[TEST_OBJECT_METADATA_ID, new Set(fieldIds)]]);

describe('sanitizeChartFiltersInPageLayoutDraft', () => {
  it('should drop chart filter rules that reference deactivated or deleted fields on save', () => {
    const validFilter = buildRecordFilter({
      id: 'filter-1',
      fieldMetadataId: ACTIVE_FIELD_ID,
    });

    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: buildChartFilters([
          validFilter,
          buildRecordFilter({
            id: 'filter-2',
            fieldMetadataId: DELETED_FIELD_ID,
          }),
        ]),
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0].configuration as {
      filter: ChartFilters;
    };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([validFilter]);
  });

  it('should keep chart filters untouched when all referenced fields are still active', () => {
    const validFilter = buildRecordFilter({
      id: 'filter-1',
      fieldMetadataId: ACTIVE_FIELD_ID,
    });

    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: buildChartFilters([validFilter]),
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0].configuration as {
      filter: ChartFilters;
    };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([validFilter]);
  });

  it('should drop orphaned filter groups left behind once invalid filters are removed', () => {
    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: {
          recordFilters: [
            buildRecordFilter({
              id: 'filter-1',
              fieldMetadataId: DELETED_FIELD_ID,
              recordFilterGroupId: 'root',
            }),
          ],
          recordFilterGroups: [
            {
              id: 'root',
              parentRecordFilterGroupId: undefined,
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
          ],
        } satisfies ChartFilters,
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: buildValidFieldsMap([
        ACTIVE_FIELD_ID,
      ]),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0].configuration as {
      filter: ChartFilters;
    };

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
    const invalidFilter = buildRecordFilter({
      id: 'filter-1',
      fieldMetadataId: DELETED_FIELD_ID,
    });

    const widget = createTestWidget({
      id: 'chart-widget',
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        filter: buildChartFilters([invalidFilter]),
      },
    });

    const result = sanitizeChartFiltersInPageLayoutDraft({
      pageLayoutDraft: buildDraft([widget]),
      validFieldMetadataIdsByObjectMetadataId: new Map(),
    });

    const sanitizedConfiguration = result.tabs[0].widgets[0].configuration as {
      filter: ChartFilters;
    };

    expect(sanitizedConfiguration.filter.recordFilters).toEqual([invalidFilter]);
  });
});
