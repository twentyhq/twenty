import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { updateRecordTableWidgetViewFieldAggregateOperation } from '@/page-layout/widgets/record-table/utils/updateRecordTableWidgetViewFieldAggregateOperation';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

const makeRecordTableWidgetViewSnapshot = (): RecordTableWidgetViewSnapshot =>
  ({
    view: { id: 'view-id' },
    viewFields: [
      {
        id: 'persisted-view-field-id',
        fieldMetadataId: 'persisted-field-metadata-id',
        viewId: 'view-id',
        isVisible: true,
        position: 0,
        size: 180,
        aggregateOperation: null,
      },
      {
        clientRecordFieldId: 'draft-client-field-id',
        fieldMetadataId: 'draft-field-metadata-id',
        viewId: 'view-id',
        isVisible: true,
        position: 1,
        size: 180,
        aggregateOperation: null,
      },
    ],
    viewFilters: [],
    viewFilterGroups: [],
    viewSorts: [],
  }) as unknown as RecordTableWidgetViewSnapshot;

describe('updateRecordTableWidgetViewFieldAggregateOperation', () => {
  it('should update a persisted draft view field aggregate operation', () => {
    const snapshot = makeRecordTableWidgetViewSnapshot();

    expect(
      updateRecordTableWidgetViewFieldAggregateOperation({
        snapshot,
        viewFieldId: 'persisted-view-field-id',
        aggregateOperation: AggregateOperations.SUM,
      }).viewFields[0].aggregateOperation,
    ).toBe(AggregateOperations.SUM);
  });

  it('should update a draft-only client view field aggregate operation', () => {
    const snapshot = makeRecordTableWidgetViewSnapshot();

    expect(
      updateRecordTableWidgetViewFieldAggregateOperation({
        snapshot,
        viewFieldId: 'draft-client-field-id',
        aggregateOperation: AggregateOperations.COUNT,
      }).viewFields[1].aggregateOperation,
    ).toBe(AggregateOperations.COUNT);
  });

  it('should return the original snapshot when no view field matches', () => {
    const snapshot = makeRecordTableWidgetViewSnapshot();

    expect(
      updateRecordTableWidgetViewFieldAggregateOperation({
        snapshot,
        viewFieldId: 'missing-view-field-id',
        aggregateOperation: AggregateOperations.SUM,
      }),
    ).toBe(snapshot);
  });
});
