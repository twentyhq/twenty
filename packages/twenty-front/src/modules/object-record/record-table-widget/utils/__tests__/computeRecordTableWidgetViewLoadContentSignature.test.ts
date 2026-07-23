import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { computeRecordTableWidgetViewLoadContentSignature } from '@/object-record/record-table-widget/utils/computeRecordTableWidgetViewLoadContentSignature';
import { type View } from '@/views/types/View';

const makeView = (aggregateOperation: AggregateOperations | null): View =>
  ({
    viewFields: [
      {
        id: 'view-field-id',
        fieldMetadataId: 'field-metadata-id',
        isVisible: true,
        position: 0,
        aggregateOperation,
      },
    ],
    viewFilters: [],
    viewFilterGroups: [],
    viewSorts: [],
  }) as unknown as View;

describe('computeRecordTableWidgetViewLoadContentSignature', () => {
  it('should include aggregate operations in the record table widget view load signature', () => {
    expect(
      computeRecordTableWidgetViewLoadContentSignature(
        makeView(AggregateOperations.SUM),
      ),
    ).not.toEqual(
      computeRecordTableWidgetViewLoadContentSignature(makeView(null)),
    );
  });
});
