import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { getReadableRelationsWithArguments } from '@/object-record/graphql/utils/getReadableRelationsWithArguments';
import { getRelationsWithArgumentsVariableDefinitions } from '@/object-record/graphql/utils/getRelationsWithArgumentsVariableDefinitions';
import { getRelationsWithArgumentsVariables } from '@/object-record/graphql/utils/getRelationsWithArgumentsVariables';
import { type RecordGqlFieldsRelationWithArguments } from 'twenty-shared/types';
import { computeRelationWithArgumentsResponseKey } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const peopleInParis: RecordGqlFieldsRelationWithArguments = {
  relationFieldName: 'people',
  filter: { city: { eq: 'Paris' } },
  first: 1,
  recordGqlFields: { id: true },
};

const responseKey = computeRelationWithArgumentsResponseKey(peopleInParis);

const buildPermissions = (canReadPeople: boolean) => ({
  [personObjectMetadataItem.id]: {
    ...getDefaultObjectPermissions(),
    canReadAllRecords: canReadPeople,
  },
});

const getReadableRelations = ({
  recordGqlFields = { [responseKey]: peopleInParis },
  canReadPeople = true,
} = {}) =>
  getReadableRelationsWithArguments({
    objectMetadataItem: companyObjectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    objectPermissionsByObjectMetadataId: buildPermissions(canReadPeople),
  });

describe('getReadableRelationsWithArguments', () => {
  it('resolves a one-to-many relation with arguments to its variables', () => {
    const readableRelations = getReadableRelations();

    expect(readableRelations).toHaveLength(1);
    expect(
      getRelationsWithArgumentsVariableDefinitions(readableRelations),
    ).toBe(
      `, $${responseKey}Filter: PersonFilterInput, $${responseKey}OrderBy: [PersonOrderByInput], $${responseKey}First: Int`,
    );
    expect(getRelationsWithArgumentsVariables(readableRelations)).toEqual({
      [`${responseKey}Filter`]: { city: { eq: 'Paris' } },
      [`${responseKey}OrderBy`]: undefined,
      [`${responseKey}First`]: 1,
    });
  });

  it('leaves out a relation whose target the user cannot read', () => {
    expect(getReadableRelations({ canReadPeople: false })).toEqual([]);
  });

  it('leaves out a field that is not a one-to-many relation', () => {
    const relationToOne = {
      ...peopleInParis,
      relationFieldName: 'accountOwner',
    };

    expect(
      getReadableRelations({
        recordGqlFields: {
          [computeRelationWithArgumentsResponseKey(relationToOne)]:
            relationToOne,
        },
      }),
    ).toEqual([]);
  });

  it('rejects a key that is not derived from the arguments', () => {
    expect(() =>
      getReadableRelations({
        recordGqlFields: { scopedPeople: peopleInParis },
      }),
    ).toThrow('must be keyed by computeRelationWithArgumentsResponseKey');
  });
});
