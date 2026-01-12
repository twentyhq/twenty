import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getOrderByForRelationField } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getOrderByForRelationField', () => {
  it('should generate nested orderBy for relation with TEXT label identifier', () => {
    const field: Pick<FieldMetadataItem, 'name'> = {
      name: 'company',
    };

    const relatedObjectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'labelIdentifierFieldMetadataId'
    > = {
      labelIdentifierFieldMetadataId: 'name-field-id',
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
        } as FieldMetadataItem,
      ],
    };

    const result = getOrderByForRelationField(
      field,
      relatedObjectMetadataItem,
      'AscNullsLast',
    );

    // Should produce nested structure: { company: { name: 'AscNullsLast' } }
    expect(result).toEqual([{ company: { name: 'AscNullsLast' } }]);
  });

  it('should generate nested orderBy for relation with FULL_NAME label identifier', () => {
    const field: Pick<FieldMetadataItem, 'name'> = {
      name: 'person',
    };

    const relatedObjectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'labelIdentifierFieldMetadataId'
    > = {
      labelIdentifierFieldMetadataId: 'name-field-id',
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.FULL_NAME,
        } as FieldMetadataItem,
      ],
    };

    const result = getOrderByForRelationField(
      field,
      relatedObjectMetadataItem,
      'DescNullsLast',
    );

    // Should produce nested structure with composite field
    expect(result).toEqual([
      {
        person: {
          name: {
            firstName: 'DescNullsLast',
            lastName: 'DescNullsLast',
          },
        },
      },
    ]);
  });

  it('should fallback to FK when no label identifier field is found', () => {
    const field: Pick<FieldMetadataItem, 'name'> = {
      name: 'company',
    };

    const relatedObjectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'labelIdentifierFieldMetadataId'
    > = {
      labelIdentifierFieldMetadataId: 'non-existent-field-id',
      fields: [],
    };

    const result = getOrderByForRelationField(
      field,
      relatedObjectMetadataItem,
      'AscNullsLast',
    );

    expect(result).toEqual([{ companyId: 'AscNullsLast' }]);
  });

  it('should use default "name" field when labelIdentifierFieldMetadataId is not set', () => {
    const field: Pick<FieldMetadataItem, 'name'> = {
      name: 'company',
    };

    const relatedObjectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'labelIdentifierFieldMetadataId'
    > = {
      labelIdentifierFieldMetadataId: undefined as unknown as string,
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
        } as FieldMetadataItem,
      ],
    };

    const result = getOrderByForRelationField(
      field,
      relatedObjectMetadataItem,
      'AscNullsLast',
    );

    // When labelIdentifierFieldMetadataId is not set, isLabelIdentifierField
    // falls back to checking for a field named 'name'
    expect(result).toEqual([{ company: { name: 'AscNullsLast' } }]);
  });

  it('should handle descending direction', () => {
    const field: Pick<FieldMetadataItem, 'name'> = {
      name: 'company',
    };

    const relatedObjectMetadataItem: Pick<
      ObjectMetadataItem,
      'fields' | 'labelIdentifierFieldMetadataId'
    > = {
      labelIdentifierFieldMetadataId: 'name-field-id',
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
        } as FieldMetadataItem,
      ],
    };

    const result = getOrderByForRelationField(
      field,
      relatedObjectMetadataItem,
      'DescNullsLast',
    );

    expect(result).toEqual([{ company: { name: 'DescNullsLast' } }]);
  });
});
