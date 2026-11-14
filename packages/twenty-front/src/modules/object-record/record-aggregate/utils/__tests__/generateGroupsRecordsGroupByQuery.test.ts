import { generateGroupsRecordsGroupByQuery } from '@/object-record/record-aggregate/utils/generateGroupsRecordsGroupByQuery';
import { print } from 'graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const generateQuery = (
  relationAliases?: Parameters<
    typeof generateGroupsRecordsGroupByQuery
  >[0]['relationAliases'],
) =>
  print(
    generateGroupsRecordsGroupByQuery({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      recordGqlFields: { id: true },
      objectPermissionsByObjectMetadataId: {},
      relationAliases,
    }),
  );

describe('generateGroupsRecordsGroupByQuery', () => {
  it('should select each scoped relation as an alias with its own variables', () => {
    const query = generateQuery([
      {
        alias: 'scope_column',
        fieldName: 'people',
        relationObjectMetadataItem: personObjectMetadataItem,
      },
    ]);

    expect(query).toContain('$scope_columnFilter: PersonFilterInput');
    expect(query).toContain('$scope_columnOrderBy: [PersonOrderByInput]');
    expect(query).toContain('$scope_columnFirst: Int');
    expect(query.replace(/\s+/g, ' ')).toContain(
      'scope_column: people( filter: $scope_columnFilter orderBy: $scope_columnOrderBy first: $scope_columnFirst )',
    );
  });

  it('should leave the query untouched without scoped relations', () => {
    expect(generateQuery([])).toBe(generateQuery());
    expect(generateQuery()).not.toContain('scope_');
  });
});
