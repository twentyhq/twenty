import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { computeRecordTableWidgetViewLoadContentSignature } from '@/object-record/record-table-widget/utils/computeRecordTableWidgetViewLoadContentSignature';
import { type View } from '@/views/types/View';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';

const makeView = (aggregateOperation: AggregateOperations | null): View => ({
  ...mockedViews[0],
  viewFields: [
    {
      id: 'view-field-id',
      fieldMetadataId: 'field-metadata-id',
      isVisible: true,
      isActive: true,
      size: 100,
      position: 0,
      aggregateOperation,
    },
  ],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
});

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

  it('should include the any-field filter in the record table widget view load signature', () => {
    expect(
      computeRecordTableWidgetViewLoadContentSignature({
        ...makeView(null),
        anyFieldFilterValue: 'Acme',
      }),
    ).not.toEqual(
      computeRecordTableWidgetViewLoadContentSignature({
        ...makeView(null),
        anyFieldFilterValue: '',
      }),
    );
  });
});
