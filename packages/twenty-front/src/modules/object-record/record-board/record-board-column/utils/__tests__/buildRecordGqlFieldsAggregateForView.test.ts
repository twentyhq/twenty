import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildRecordGqlFieldsAggregateForView } from '@/object-record/record-board/record-board-column/utils/buildRecordGqlFieldsAggregateForView';

import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const MOCK_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';

describe('buildRecordGqlFieldsAggregateForView', () => {
  const fields = [
    {
      id: MOCK_FIELD_ID,
      name: 'amount',
      type: FieldMetadataType.NUMBER,
    } as FieldMetadataItem,
    {
      id: '06b33746-5293-4d07-9f7f-ebf5ad396064',
      name: 'name',
      type: FieldMetadataType.TEXT,
    } as FieldMetadataItem,
    {
      id: 'e46b9ba4-144b-4d10-a092-03a7521c8aa0',
      name: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
    } as FieldMetadataItem,
  ];

  const mockObjectMetadata: ObjectMetadataItem = {
    id: '123',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    labelSingular: 'Opportunity',
    labelPlural: 'Opportunities',
    isCustom: false,
    isActive: true,
    isSystem: false,
    isUIReadOnly: false,
    isRemote: false,
    isSearchable: false,
    labelIdentifierFieldMetadataId: '06b33746-5293-4d07-9f7f-ebf5ad396064',
    imageIdentifierFieldMetadataId: null,
    isLabelSyncedWithName: true,
    fields,
    readableFields: fields,
    updatableFields: fields,
    indexMetadatas: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockFieldMetadataItem = fields[0];

  it('should build fields for numeric aggregate', () => {
    const result = buildRecordGqlFieldsAggregateForView({
      objectMetadataItem: mockObjectMetadata,
      recordIndexGroupAggregateFieldMetadataItem: mockFieldMetadataItem,
      recordIndexGroupAggregateOperation: AggregateOperations.SUM,
    });

    expect(result).toEqual({
      amount: [AggregateOperations.SUM],
    });
  });

  it('should default to count when no field is found', () => {
    const result = buildRecordGqlFieldsAggregateForView({
      objectMetadataItem: mockObjectMetadata,
      recordIndexGroupAggregateFieldMetadataItem: null,
      recordIndexGroupAggregateOperation: AggregateOperations.COUNT,
    });

    expect(result).toEqual({
      id: [AggregateOperations.COUNT],
    });
  });

  it('should throw error for non-count operation with invalid field', () => {
    expect(() =>
      buildRecordGqlFieldsAggregateForView({
        objectMetadataItem: mockObjectMetadata,
        recordIndexGroupAggregateFieldMetadataItem: null,
        recordIndexGroupAggregateOperation: AggregateOperations.SUM,
      }),
    ).toThrow(
      `No field found to compute aggregate operation ${AggregateOperations.SUM} on object ${mockObjectMetadata.nameSingular}`,
    );
  });
});
