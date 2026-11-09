import {
  DRAFT_VIEW_SNAPSHOT,
  SAVED_VIEW,
} from '@/page-layout/testing/recordTableWidgetViewFixtures';
import { getPageLayoutWidgetFilter } from '@/page-layout/utils/getPageLayoutWidgetFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';
import { TEST_BAR_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

const RECORD_TABLE_WIDGET = {
  id: 'widget-1',
  configuration: {
    __typename: 'RecordTableConfiguration' as const,
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: SAVED_VIEW.id,
  },
};

const viewsById = new Map([[SAVED_VIEW.id, SAVED_VIEW]]);

const getFilteredFieldMetadataIds = (
  recordTableWidgetViewDrafts: Parameters<
    typeof getPageLayoutWidgetFilter
  >[0]['recordTableWidgetViewDrafts'],
) =>
  getPageLayoutWidgetFilter({
    widget: RECORD_TABLE_WIDGET,
    viewsById,
    recordTableWidgetViewDrafts,
  }).recordFilters.map(({ fieldMetadataId }) => fieldMetadataId);

describe('getPageLayoutWidgetFilter', () => {
  it('should read the unsaved view of a record table first', () => {
    expect(
      getFilteredFieldMetadataIds({
        [RECORD_TABLE_WIDGET.id]: DRAFT_VIEW_SNAPSHOT,
      }),
    ).toEqual(['draft-field-id']);
  });

  it('should read the saved view of a record table without an unsaved one', () => {
    expect(
      getPageLayoutWidgetFilter({
        widget: RECORD_TABLE_WIDGET,
        viewsById,
        recordTableWidgetViewDrafts: {},
      }),
    ).toEqual({
      recordFilters: [
        {
          id: 'saved-view-filter',
          fieldMetadataId: 'saved-field-id',
          operand: ViewFilterOperand.IS_AFTER,
          value: '2026-01-01',
          recordFilterGroupId: undefined,
        },
      ],
      recordFilterGroups: [],
    });
  });

  it("should read a chart's own filter", () => {
    const filter = {
      recordFilters: [
        {
          fieldMetadataId: 'close-date-field-id',
          operand: ViewFilterOperand.IS_TODAY,
          value: '',
        },
      ],
    };

    expect(
      getPageLayoutWidgetFilter({
        widget: {
          id: 'chart',
          configuration: { ...TEST_BAR_CHART_CONFIGURATION, filter },
        },
        viewsById,
        recordTableWidgetViewDrafts: {},
      }),
    ).toEqual({ ...filter, recordFilterGroups: [] });
  });
});
