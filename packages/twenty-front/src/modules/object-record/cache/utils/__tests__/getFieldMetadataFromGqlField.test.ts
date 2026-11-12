import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RelationType } from 'twenty-shared/types';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getFieldMetadataFromGqlField } from '@/object-record/cache/utils/getFieldMetadataFromGqlField';

const BASE_FIELD_METADATA_ITEM = {
  id: 'field-id',
  universalIdentifier: 'field-id',
  label: 'Field',
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
};

const objectMetadataItemGenerator = (relationType: RelationType) => {
  return {
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      {
        ...BASE_FIELD_METADATA_ITEM,
        name: 'owner',
        type: FieldMetadataType.MORPH_RELATION,
        morphRelations: [
          {
            type: relationType,
            targetObjectMetadata: {
              id: 'target-object-id',
              nameSingular: 'company',
              namePlural: 'companies',
            },
            targetFieldMetadata: {
              id: 'target-field-id',
              name: 'ownedBy',
              type: FieldMetadataType.RELATION,
            },
            sourceFieldMetadata: {
              id: 'source-field-id',
              name: 'owner',
              type: FieldMetadataType.MORPH_RELATION,
            },
            sourceObjectMetadata: {
              id: 'source-object-id',
              nameSingular: 'opportunity',
              namePlural: 'opportunities',
            },
          },
          {
            type: relationType,
            targetObjectMetadata: {
              id: 'target-object-id',
              nameSingular: 'person',
              namePlural: 'people',
            },
            targetFieldMetadata: {
              id: 'target-field-id',
              name: 'ownedBy',
              type: FieldMetadataType.RELATION,
            },
            sourceFieldMetadata: {
              id: 'source-field-id',
              name: 'owner',
              type: FieldMetadataType.MORPH_RELATION,
            },
            sourceObjectMetadata: {
              id: 'source-object-id',
              nameSingular: 'opportunity',
              namePlural: 'opportunities',
            },
          },
        ],
      },
    ],
  };
};

describe('getFieldMetadataFromGqlField', () => {
  it('should find "name"', () => {
    const objectMetadataItem = {
      fields: [
        {
          ...BASE_FIELD_METADATA_ITEM,
          name: 'name',
          type: FieldMetadataType.FULL_NAME,
        },
      ],
    };

    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'name',
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('name');
    expect(result?.type).toBe(FieldMetadataType.FULL_NAME);
  });

  it('should find company by join column name of a relation field', () => {
    const objectMetadataItem = {
      fields: [
        {
          name: 'company',
          type: FieldMetadataType.RELATION,
          settings: {
            joinColumnName: 'companyId',
          },
        } as FieldMetadataItem,
      ],
    };

    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'companyId',
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('company');
    expect(result?.type).toBe(FieldMetadataType.RELATION);
    expect(result?.settings?.joinColumnName).toBe('companyId');
  });

  it('should return undefined for non-existent field', () => {
    const objectMetadataItem = {
      fields: [
        {
          ...BASE_FIELD_METADATA_ITEM,
          name: 'name',
          type: FieldMetadataType.TEXT,
        },
      ],
    };

    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'nonExistentField',
    });

    expect(result).toBeUndefined();
  });

  it('should find owner by direct morph relation ONE_TO_MANY field name', () => {
    const objectMetadataItem = objectMetadataItemGenerator(
      RelationType.ONE_TO_MANY,
    );
    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'owner',
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('owner');
    expect(result?.type).toBe(FieldMetadataType.MORPH_RELATION);
  });

  it('should find ownerCompanies by computed morph relation ONE_TO_MANY field name', () => {
    const objectMetadataItem = objectMetadataItemGenerator(
      RelationType.ONE_TO_MANY,
    );
    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'ownerCompanies',
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('owner');
    expect(result?.type).toBe(FieldMetadataType.MORPH_RELATION);
  });

  it('should find ownerPerson by computed morph relation MANY_TO_ONE field name', () => {
    const objectMetadataItem = objectMetadataItemGenerator(
      RelationType.MANY_TO_ONE,
    );
    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'ownerPerson',
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('owner');
    expect(result?.type).toBe(FieldMetadataType.MORPH_RELATION);
  });

  it('should find ownerPersonId by computed morph relation join column name MANY_TO_ONE field name', () => {
    const objectMetadataItem = objectMetadataItemGenerator(
      RelationType.MANY_TO_ONE,
    );
    const result = getFieldMetadataFromGqlField({
      objectMetadataItem,
      gqlField: 'ownerPersonId',
    });

    expect(result).toBeDefined();
    expect(result?.name).toBe('owner');
    expect(result?.type).toBe(FieldMetadataType.MORPH_RELATION);
  });
});
