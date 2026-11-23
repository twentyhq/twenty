import { getDefaultObjectPermissions } from '@/object-metadata/utils/getDefaultObjectPermissions';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { print } from 'graphql';
import {
  type RecordGqlFields,
  type RecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/types';
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

const generateQuery = ({
  extraRecordGqlFields = { [responseKey]: peopleInParis },
  canReadPeople = true,
}: {
  extraRecordGqlFields?: RecordGqlFields;
  canReadPeople?: boolean;
} = {}) => {
  const { query, variables } = generateFindManyRecordsQuery({
    objectMetadataItem: companyObjectMetadataItem,
    objectMetadataItems,
    recordGqlFields: { id: true, ...extraRecordGqlFields },
    objectPermissionsByObjectMetadataId: {
      [personObjectMetadataItem.id]: {
        ...getDefaultObjectPermissions(),
        canReadAllRecords: canReadPeople,
      },
    },
  });

  return { query: print(query), variables };
};

describe('generateFindManyRecordsQuery with relations with arguments', () => {
  it('selects the relation under its response key and passes its arguments as variables', () => {
    const { query, variables } = generateQuery();

    expect(query).toContain(
      `$${responseKey}Filter: PersonFilterInput, $${responseKey}OrderBy: [PersonOrderByInput], $${responseKey}First: Int`,
    );
    expect(query).toContain(`${responseKey}: people(`);
    expect(query).toContain(`filter: $${responseKey}Filter`);
    expect(query).toContain(`orderBy: $${responseKey}OrderBy`);
    expect(query).toContain(`first: $${responseKey}First`);
    expect(variables).toEqual({
      [`${responseKey}Filter`]: { city: { eq: 'Paris' } },
      [`${responseKey}OrderBy`]: undefined,
      [`${responseKey}First`]: 1,
    });
  });

  it('selects the aggregates of the relation beside its edges', () => {
    const peopleInParisWithTotalCount: RecordGqlFieldsRelationWithArguments = {
      ...peopleInParis,
      aggregateGqlFieldNames: ['totalCount'],
    };

    expect(generateQuery().query).not.toMatch(/totalCount\s+edges/);
    expect(
      generateQuery({
        extraRecordGqlFields: {
          [computeRelationWithArgumentsResponseKey(
            peopleInParisWithTotalCount,
          )]: peopleInParisWithTotalCount,
        },
      }).query,
    ).toMatch(/totalCount\s+edges/);
  });

  it('selects a composite field of the related records with its sub-fields', () => {
    const peopleInParisWithEmails: RecordGqlFieldsRelationWithArguments = {
      ...peopleInParis,
      recordGqlFields: { id: true, emails: true },
    };

    expect(
      generateQuery({
        extraRecordGqlFields: {
          [computeRelationWithArgumentsResponseKey(peopleInParisWithEmails)]:
            peopleInParisWithEmails,
        },
      }).query,
    ).toMatch(/emails \{\s+primaryEmail\s+additionalEmails\s+\}/);
  });

  it('selects and declares nothing for an unreadable target', () => {
    expect(generateQuery({ canReadPeople: false })).toEqual(
      generateQuery({ extraRecordGqlFields: {}, canReadPeople: false }),
    );
  });

  it('selects and declares nothing for a field that is not a one-to-many relation', () => {
    const relationToOne = {
      ...peopleInParis,
      relationFieldName: 'accountOwner',
    };

    expect(
      generateQuery({
        extraRecordGqlFields: {
          [computeRelationWithArgumentsResponseKey(relationToOne)]:
            relationToOne,
        },
      }),
    ).toEqual(generateQuery({ extraRecordGqlFields: {} }));
  });

  it('rejects a key that is not derived from the arguments', () => {
    expect(() =>
      generateQuery({ extraRecordGqlFields: { scopedPeople: peopleInParis } }),
    ).toThrow('must be keyed by computeRelationWithArgumentsResponseKey');
  });
});
