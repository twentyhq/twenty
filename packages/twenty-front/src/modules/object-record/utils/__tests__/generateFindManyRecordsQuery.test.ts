import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { print } from 'graphql';
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

describe('generateFindManyRecordsQuery with relations with arguments', () => {
  const generateQuery = ({
    withRelation = true,
    relation = peopleInParis,
    canReadPeople = true,
  } = {}) =>
    print(
      generateFindManyRecordsQuery({
        objectMetadataItem: companyObjectMetadataItem,
        objectMetadataItems,
        recordGqlFields: {
          id: true,
          ...(withRelation && {
            [computeRelationWithArgumentsResponseKey(relation)]: relation,
          }),
        },
        objectPermissionsByObjectMetadataId: buildPermissions(canReadPeople),
      }),
    );

  it('selects the relation under its response key and declares its variables', () => {
    const query = generateQuery();

    expect(query).toContain(`$${responseKey}Filter: PersonFilterInput`);
    expect(query).toContain(`${responseKey}: people(`);
    expect(query).toContain(`filter: $${responseKey}Filter`);
    expect(query).toContain(`orderBy: $${responseKey}OrderBy`);
    expect(query).toContain(`first: $${responseKey}First`);
  });

  it('selects the total count of the relation only when it is limited', () => {
    expect(
      generateQuery({ relation: { ...peopleInParis, first: undefined } }),
    ).not.toMatch(/totalCount\s+edges/);
    expect(generateQuery()).toMatch(/totalCount\s+edges/);
  });

  it('selects and declares nothing for an unreadable target', () => {
    expect(generateQuery({ canReadPeople: false })).toBe(
      generateQuery({ withRelation: false, canReadPeople: false }),
    );
  });
});
