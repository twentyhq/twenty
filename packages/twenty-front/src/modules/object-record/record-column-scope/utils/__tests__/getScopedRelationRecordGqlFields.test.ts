import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getScopedRelationRecordGqlFields } from '@/object-record/record-column-scope/utils/getScopedRelationRecordGqlFields';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const personIdentifierGqlFields = buildIdentifierGqlFields(
  personObjectMetadataItem,
);

const buildLookupTarget = (
  fieldName: string,
): ScopedRelationAlias['lookupTarget'] => {
  const lookupTargetFieldMetadataItem = getMockFieldMetadataItemOrThrow({
    objectMetadataItem: personObjectMetadataItem,
    fieldName,
  });

  return {
    relationFieldName: 'people',
    relationObjectMetadataItem: personObjectMetadataItem,
    lookupTargetFieldMetadataItem,
    lookupTargetFieldDefinition: formatFieldMetadataItemAsFieldDefinition({
      field: lookupTargetFieldMetadataItem,
      objectMetadataItem: personObjectMetadataItem,
    }),
  };
};

const buildPeopleAlias = (
  scopedRelationAlias: Pick<ScopedRelationAlias, 'responseKey'> &
    Partial<ScopedRelationAlias>,
): ScopedRelationAlias => ({
  recordFieldId: 'people-column',
  relationFieldName: 'people',
  relationObjectMetadataItem: personObjectMetadataItem,
  relationJoinColumnName: 'companyId',
  ...scopedRelationAlias,
});

describe('getScopedRelationRecordGqlFields', () => {
  it('selects the field a column shows next to the identifier of its records', () => {
    expect(
      getScopedRelationRecordGqlFields([
        buildPeopleAlias({
          responseKey: 'people_limited',
          first: 2,
          lookupTarget: buildLookupTarget('emails'),
        }),
      ]),
    ).toEqual({
      people_limited: expect.objectContaining({
        first: 2,
        shouldIncludeTotalCount: true,
        recordGqlFields: { ...personIdentifierGqlFields, emails: true },
      }),
    });
  });

  it('selects the fields of every column sharing one scope under their one response key', () => {
    expect(
      getScopedRelationRecordGqlFields([
        buildPeopleAlias({
          responseKey: 'people_all',
          lookupTarget: buildLookupTarget('emails'),
        }),
        buildPeopleAlias({ responseKey: 'people_all' }),
        buildPeopleAlias({
          responseKey: 'people_all',
          lookupTarget: buildLookupTarget('jobTitle'),
        }),
      ]),
    ).toEqual({
      people_all: expect.objectContaining({
        recordGqlFields: {
          ...personIdentifierGqlFields,
          emails: true,
          jobTitle: true,
        },
      }),
    });
  });
});
