import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildRecordGqlFieldsAggregateForRecordBoard } from '@/object-record/record-board/record-board-column/utils/buildRecordGqlFieldsAggregateForRecordBoard';
import { KanbanAggregateOperation } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const MOCK_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';
const MOCK_KANBAN_FIELD = 'stage';

describe('buildRecordGqlFieldsAggregateForRecordBoard', () => {
  const mockObjectMetadata: ObjectMetadataItem = {
    id: '123',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    labelSingular: 'Opportunity',
    labelPlural: 'Opportunities',
    isCustom: false,
    isActive: true,
    isSystem: false,
    isRemote: false,
    labelIdentifierFieldMetadataId: null,
    imageIdentifierFieldMetadataId: null,
    isLabelSyncedWithName: true,
    fields: [
      {
        id: MOCK_FIELD_ID,
        name: 'amount',
        type: FieldMetadataType.Number,
      } as FieldMetadataItem,
      {
        id: '06b33746-5293-4d07-9f7f-ebf5ad396064',
        name: 'name',
        type: FieldMetadataType.Text,
      } as FieldMetadataItem,
      {
        id: 'e46b9ba4-144b-4d10-a092-03a7521c8aa0',
        name: 'createdAt',
        type: FieldMetadataType.DateTime,
      } as FieldMetadataItem,
    ],
    indexMetadatas: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should build fields for numeric aggregate', () => {
    const kanbanAggregateOperation: KanbanAggregateOperation = {
      fieldMetadataId: MOCK_FIELD_ID,
      operation: AGGREGATE_OPERATIONS.sum,
    };

    const result = buildRecordGqlFieldsAggregateForRecordBoard({
      objectMetadataItem: mockObjectMetadata,
      recordIndexKanbanAggregateOperation: kanbanAggregateOperation,
      kanbanFieldName: MOCK_KANBAN_FIELD,
    });

    expect(result).toEqual({
      amount: [AGGREGATE_OPERATIONS.sum],
    });
  });

  it('should default to count when no field is found', () => {
    const operation: KanbanAggregateOperation = {
      fieldMetadataId: 'non-existent-id',
      operation: AGGREGATE_OPERATIONS.count,
    };

    const result = buildRecordGqlFieldsAggregateForRecordBoard({
      objectMetadataItem: mockObjectMetadata,
      recordIndexKanbanAggregateOperation: operation,
      kanbanFieldName: MOCK_KANBAN_FIELD,
    });

    expect(result).toEqual({
      [MOCK_KANBAN_FIELD]: [AGGREGATE_OPERATIONS.count],
    });
  });

  it('should throw error for non-count operation with invalid field', () => {
    const operation: KanbanAggregateOperation = {
      fieldMetadataId: 'non-existent-id',
      operation: AGGREGATE_OPERATIONS.sum,
    };

    expect(() =>
      buildRecordGqlFieldsAggregateForRecordBoard({
        objectMetadataItem: mockObjectMetadata,
        recordIndexKanbanAggregateOperation: operation,
        kanbanFieldName: MOCK_KANBAN_FIELD,
      }),
    ).toThrow(
      `No field found to compute aggregate operation ${AGGREGATE_OPERATIONS.sum} on object ${mockObjectMetadata.nameSingular}`,
    );
  });
});
