import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRelationTableFilter } from '@/page-layout/widgets/field/utils/getRelationTableFilter';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

const RECORD_ID = '20202020-1111-2222-3333-444444444444';

const buildRelationField = (
  overrides: Partial<FieldMetadataItem> = {},
): FieldMetadataItem =>
  ({
    id: 'field-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    label: 'Company',
    ...overrides,
  }) as FieldMetadataItem;

describe('getRelationTableFilter', () => {
  it('builds a foreign-key filter for a to-many relation', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        relationFieldMetadataItem: buildRelationField({ name: 'company' }),
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toEqual({ companyId: { in: [RECORD_ID] } });
  });

  it('returns undefined for a to-one relation (no host foreign key)', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.MANY_TO_ONE,
        relationFieldMetadataItem: buildRelationField(),
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the relation type is unknown', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: undefined,
        relationFieldMetadataItem: buildRelationField(),
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toBeUndefined();
  });

  it('returns undefined when the inverse relation field cannot be resolved', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        relationFieldMetadataItem: undefined,
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toBeUndefined();
  });

  it('resolves the gql field name for a morph relation', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        relationFieldMetadataItem: buildRelationField({
          name: 'target',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
        }),
        targetObjectMetadataNameSingular: 'company',
        targetObjectMetadataNamePlural: 'companies',
      }),
    ).toEqual({ targetCompanyId: { in: [RECORD_ID] } });
  });

  it('returns undefined for a morph relation when target object names are missing', () => {
    expect(
      getRelationTableFilter({
        recordId: RECORD_ID,
        relationType: RelationType.ONE_TO_MANY,
        relationFieldMetadataItem: buildRelationField({
          name: 'target',
          type: FieldMetadataType.MORPH_RELATION,
          settings: { relationType: RelationType.MANY_TO_ONE },
        }),
        targetObjectMetadataNameSingular: undefined,
        targetObjectMetadataNamePlural: undefined,
      }),
    ).toBeUndefined();
  });
});
