import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationTableFilter } from '@/page-layout/widgets/field/utils/getRelationTableFilter';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-1111-2222-3333-444444444444';

const buildInverseRelationField = (
  overrides: Partial<
    Pick<FieldMetadataItem, 'name' | 'type' | 'settings'>
  > = {},
): Pick<FieldMetadataItem, 'name' | 'type' | 'settings'> => ({
  name: 'company',
  type: FieldMetadataType.RELATION,
  ...overrides,
});

describe('getRelationTableFilter', () => {
  it('builds a foreign-key filter for a to-many relation', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        inverseRelationFieldMetadataItem: buildInverseRelationField({
          name: 'company',
        }),
        recordObjectMetadataNameSingular: 'company',
        recordObjectMetadataNamePlural: 'companies',
      }),
    ).toEqual({ companyId: { in: [RECORD_ID] } });
  });

  it('returns undefined for a to-one relation (no host foreign key)', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.MANY_TO_ONE,
        inverseRelationFieldMetadataItem: buildInverseRelationField(),
        recordObjectMetadataNameSingular: 'company',
        recordObjectMetadataNamePlural: 'companies',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the relation type is unknown', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: undefined,
        inverseRelationFieldMetadataItem: buildInverseRelationField(),
        recordObjectMetadataNameSingular: 'company',
        recordObjectMetadataNamePlural: 'companies',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the inverse relation field cannot be resolved', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        inverseRelationFieldMetadataItem: undefined,
        recordObjectMetadataNameSingular: 'company',
        recordObjectMetadataNamePlural: 'companies',
      }),
    ).toBeUndefined();
  });

  it('resolves the gql field name for a morph relation', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        inverseRelationFieldMetadataItem: buildInverseRelationField({
          name: 'target',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
        }),
        recordObjectMetadataNameSingular: 'company',
        recordObjectMetadataNamePlural: 'companies',
      }),
    ).toEqual({ targetCompanyId: { in: [RECORD_ID] } });
  });

  it('returns undefined for a morph relation when host object names are missing', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        inverseRelationFieldMetadataItem: buildInverseRelationField({
          name: 'target',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
        }),
        recordObjectMetadataNameSingular: undefined,
        recordObjectMetadataNamePlural: undefined,
      }),
    ).toBeUndefined();
  });
});
