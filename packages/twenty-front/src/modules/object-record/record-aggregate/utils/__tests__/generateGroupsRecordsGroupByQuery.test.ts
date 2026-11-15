import { generateGroupsRecordsGroupByQuery } from '@/object-record/record-aggregate/utils/generateGroupsRecordsGroupByQuery';
import { print } from 'graphql';
import {
  type RecordGqlFields,
  type RecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/types';
import { computeRelationWithArgumentsResponseKey } from 'twenty-shared/utils';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const scopedPeople: RecordGqlFieldsRelationWithArguments = {
  relationFieldName: 'people',
  first: 2,
  recordGqlFields: { id: true },
};

const responseKey = computeRelationWithArgumentsResponseKey(scopedPeople);

const generateQuery = (recordGqlFields: RecordGqlFields = { id: true }) =>
  print(
    generateGroupsRecordsGroupByQuery({
      objectMetadataItem: companyObjectMetadataItem,
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      recordGqlFields,
      objectPermissionsByObjectMetadataId: {},
    }),
  );

describe('generateGroupsRecordsGroupByQuery', () => {
  it('should select each scoped relation under its response key with its own variables', () => {
    const query = generateQuery({ id: true, [responseKey]: scopedPeople });

    expect(query).toContain(`$${responseKey}Filter: PersonFilterInput`);
    expect(query).toContain(`$${responseKey}OrderBy: [PersonOrderByInput]`);
    expect(query).toContain(`$${responseKey}First: Int`);
    expect(query.replace(/\s+/g, ' ')).toContain(
      `${responseKey}: people( filter: $${responseKey}Filter orderBy: $${responseKey}OrderBy first: $${responseKey}First )`,
    );
  });

  it('should not declare relation variables without scoped relations', () => {
    expect(generateQuery()).not.toContain('PersonFilterInput');
  });
});
