import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { mapRecordGqlRelationAliasesToGraphQLQuery } from '@/object-record/graphql/utils/mapRecordGqlRelationAliasesToGraphQLQuery';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const relationAliases = [
  {
    alias: 'scopedPeople',
    fieldName: 'people',
    relationObjectMetadataItem: personObjectMetadataItem,
  },
];

const mapAliases = (canReadPeople: boolean) =>
  mapRecordGqlRelationAliasesToGraphQLQuery({
    relationAliases,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId: {
      [personObjectMetadataItem.id]: {
        ...getDefaultObjectPermissions(),
        canReadAllRecords: canReadPeople,
      },
    },
  });

describe('mapRecordGqlRelationAliasesToGraphQLQuery', () => {
  it('selects a readable relation under its alias with its own variables', () => {
    const { variableDefinitions, selections } = mapAliases(true);

    expect(variableDefinitions).toBe(
      ', $scopedPeopleFilter: PersonFilterInput, $scopedPeopleOrderBy: [PersonOrderByInput], $scopedPeopleFirst: Int',
    );
    expect(selections).toHaveLength(1);
    expect(selections[0]).toContain(
      'scopedPeople: people(filter: $scopedPeopleFilter, orderBy: $scopedPeopleOrderBy, first: $scopedPeopleFirst)',
    );
  });

  it('leaves out an alias whose target the user cannot read', () => {
    expect(mapAliases(false)).toEqual({
      variableDefinitions: '',
      selections: [],
    });
  });
});
