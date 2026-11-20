import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { getScopedRelationRecordGqlFields } from '@/object-record/record-column-scope/utils/getScopedRelationRecordGqlFields';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const personIdentifierGqlFields = buildIdentifierGqlFields(
  personObjectMetadataItem,
);

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
  it('selects each scoped relation under its response key with the identifier of its records', () => {
    const limitedAlias = buildPeopleAlias({
      responseKey: 'people_limited',
      filter: { jobTitle: { ilike: '%cto%' } },
      orderBy: [{ createdAt: 'AscNullsLast' }],
      first: 2,
    });
    const unlimitedAlias = buildPeopleAlias({ responseKey: 'people_all' });

    expect(
      getScopedRelationRecordGqlFields([limitedAlias, unlimitedAlias]),
    ).toEqual({
      people_limited: {
        relationFieldName: 'people',
        filter: limitedAlias.filter,
        orderBy: limitedAlias.orderBy,
        first: 2,
        shouldIncludeTotalCount: true,
        recordGqlFields: personIdentifierGqlFields,
      },
      people_all: {
        relationFieldName: 'people',
        filter: undefined,
        orderBy: undefined,
        first: undefined,
        shouldIncludeTotalCount: false,
        recordGqlFields: personIdentifierGqlFields,
      },
    });
  });
});
