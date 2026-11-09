import { SAVED_VIEW } from '@/page-layout/testing/recordTableWidgetViewFixtures';
import { getRecordTableWidgetFilter } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetFilter';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

describe('getRecordTableWidgetFilter', () => {
  it('should read view filters and groups in the record filter shape', () => {
    expect(
      getRecordTableWidgetFilter({
        viewFilters: [
          {
            id: 'view-filter',
            fieldMetadataId: 'close-date-field-id',
            operand: ViewFilterOperand.IS_TODAY,
            value: '',
            viewFilterGroupId: 'root',
          },
        ],
        viewFilterGroups: [
          {
            id: 'root',
            viewId: SAVED_VIEW.id,
            logicalOperator: ViewFilterGroupLogicalOperator.OR,
          },
        ],
      }),
    ).toEqual({
      recordFilters: [
        {
          id: 'view-filter',
          fieldMetadataId: 'close-date-field-id',
          operand: ViewFilterOperand.IS_TODAY,
          value: '',
          recordFilterGroupId: 'root',
        },
      ],
      recordFilterGroups: [
        expect.objectContaining({
          id: 'root',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        }),
      ],
    });
  });
});
