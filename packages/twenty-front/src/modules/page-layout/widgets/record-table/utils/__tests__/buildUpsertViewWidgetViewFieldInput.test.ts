import { buildUpsertViewWidgetViewFieldInput } from '@/page-layout/widgets/record-table/utils/buildUpsertViewWidgetViewFieldInput';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

describe('buildUpsertViewWidgetViewFieldInput', () => {
  it('should send persisted view field ids and aggregate operations when saving a record table widget view', () => {
    expect(
      buildUpsertViewWidgetViewFieldInput({
        id: 'view-field-id',
        fieldMetadataId: 'field-metadata-id',
        isVisible: true,
        position: 0,
        size: 180,
        aggregateOperation: AggregateOperations.SUM,
      }),
    ).toEqual({
      viewFieldId: 'view-field-id',
      fieldMetadataId: 'field-metadata-id',
      isVisible: true,
      position: 0,
      size: 180,
      aggregateOperation: AggregateOperations.SUM,
    });
  });

  it('should not send draft-only client field ids as viewFieldId', () => {
    expect(
      buildUpsertViewWidgetViewFieldInput({
        clientRecordFieldId: 'client-record-field-id',
        fieldMetadataId: 'field-metadata-id',
        isVisible: false,
        position: 1,
        size: 120,
        aggregateOperation: AggregateOperations.COUNT,
      }),
    ).toEqual({
      fieldMetadataId: 'field-metadata-id',
      isVisible: false,
      position: 1,
      size: 120,
      aggregateOperation: AggregateOperations.COUNT,
    });
  });

  it('should send null aggregate operation when the draft field has no aggregate operation', () => {
    expect(
      buildUpsertViewWidgetViewFieldInput({
        id: 'view-field-id',
        fieldMetadataId: 'field-metadata-id',
        isVisible: true,
        position: 0,
        size: 180,
      }),
    ).toEqual({
      viewFieldId: 'view-field-id',
      fieldMetadataId: 'field-metadata-id',
      isVisible: true,
      position: 0,
      size: 180,
      aggregateOperation: null,
    });
  });
});
