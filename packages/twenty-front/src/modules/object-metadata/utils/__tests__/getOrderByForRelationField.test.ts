import { getOrderByForRelationField } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('getOrderByForRelationField', () => {
  it('should generate nested orderBy for relation with TEXT label identifier', () => {
    const field = {
      id: 'company-field',
      name: 'company',
      type: FieldMetadataType.RELATION,
    };

    const relatedObjectMetadataItem = {
      labelIdentifierFieldMetadataId: 'name-field-id',
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
          isActive: true,
        },
      ],
    };

    const result = getOrderByForRelationField(
      field as any,
      relatedObjectMetadataItem as any,
      'AscNullsLast',
    );

    // Should produce nested structure: { company: { name: 'AscNullsLast' } }
    expect(result).toEqual([{ company: { name: 'AscNullsLast' } }]);
  });

  it('should generate nested orderBy for relation with FULL_NAME label identifier', () => {
    const field = {
      id: 'person-field',
      name: 'person',
      type: FieldMetadataType.RELATION,
    };

    const relatedObjectMetadataItem = {
      labelIdentifierFieldMetadataId: 'name-field-id',
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.FULL_NAME,
          isActive: true,
        },
      ],
    };

    const result = getOrderByForRelationField(
      field as any,
      relatedObjectMetadataItem as any,
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
    const field = {
      id: 'company-field',
      name: 'company',
      type: FieldMetadataType.RELATION,
    };

    const relatedObjectMetadataItem = {
      labelIdentifierFieldMetadataId: 'non-existent-field-id',
      fields: [],
    };

    const result = getOrderByForRelationField(
      field as any,
      relatedObjectMetadataItem as any,
      'AscNullsLast',
    );

    expect(result).toEqual([{ companyId: 'AscNullsLast' }]);
  });

  it('should use default "name" field when labelIdentifierFieldMetadataId is not set', () => {
    const field = {
      id: 'company-field',
      name: 'company',
      type: FieldMetadataType.RELATION,
    };

    const relatedObjectMetadataItem = {
      labelIdentifierFieldMetadataId: undefined,
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
          isActive: true,
        },
      ],
    };

    const result = getOrderByForRelationField(
      field as any,
      relatedObjectMetadataItem as any,
      'AscNullsLast',
    );

    // When labelIdentifierFieldMetadataId is not set, isLabelIdentifierField
    // falls back to checking for a field named 'name'
    expect(result).toEqual([{ company: { name: 'AscNullsLast' } }]);
  });

  it('should handle descending direction', () => {
    const field = {
      id: 'company-field',
      name: 'company',
      type: FieldMetadataType.RELATION,
    };

    const relatedObjectMetadataItem = {
      labelIdentifierFieldMetadataId: 'name-field-id',
      fields: [
        {
          id: 'name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
          isActive: true,
        },
      ],
    };

    const result = getOrderByForRelationField(
      field as any,
      relatedObjectMetadataItem as any,
      'DescNullsLast',
    );

    expect(result).toEqual([{ company: { name: 'DescNullsLast' } }]);
  });
});
