import { generateFindOneRecordQuery } from '@/object-record/utils/generateFindOneRecordQuery';
import { parse, print } from 'graphql';
import { isDefined } from 'twenty-shared/utils';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const workflowVersionMetadata = objectMetadataItems.find(
  (objectMetadataItem) => objectMetadataItem.nameSingular === 'workflowVersion',
);

if (!isDefined(workflowVersionMetadata)) {
  throw new Error('Workflow version metadata fixture is missing');
}

describe('generateFindOneRecordQuery', () => {
  it('requests one record and only the selected field plus identity and version', () => {
    const query = generateFindOneRecordQuery({
      objectMetadataItem: workflowVersionMetadata,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId: {},
      recordGqlFields: { id: true, updatedAt: true, trigger: true },
    });

    expect(print(query)).toBe(
      print(
        parse(`
          query FindOneWorkflowVersion($objectRecordId: UUID!) {
            workflowVersion(filter: { id: { eq: $objectRecordId } }) {
              __typename
              id
              trigger
              updatedAt
            }
          }
        `),
      ),
    );
  });

  it('keeps the requested value readable when updatedAt is permission restricted', () => {
    const query = generateFindOneRecordQuery({
      objectMetadataItem: {
        ...workflowVersionMetadata,
        readableFields: workflowVersionMetadata.readableFields.filter(
          (fieldMetadataItem) => fieldMetadataItem.name !== 'updatedAt',
        ),
      },
      objectMetadataItems,
      objectPermissionsByObjectMetadataId: {},
      recordGqlFields: { id: true, updatedAt: true, trigger: true },
    });

    expect(print(query)).toBe(
      print(
        parse(`
          query FindOneWorkflowVersion($objectRecordId: UUID!) {
            workflowVersion(filter: { id: { eq: $objectRecordId } }) {
              __typename
              id
              trigger
            }
          }
        `),
      ),
    );
  });

  it('includes soft-deleted records only when requested', () => {
    const query = generateFindOneRecordQuery({
      objectMetadataItem: workflowVersionMetadata,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId: {},
      recordGqlFields: { id: true },
      withSoftDeleted: true,
    });

    expect(print(query)).toBe(
      print(
        parse(`
          query FindOneWorkflowVersion($objectRecordId: UUID!) {
            workflowVersion(filter: {
              or: [
                { deletedAt: { is: NULL } },
                { deletedAt: { is: NOT_NULL } }
              ],
              id: { eq: $objectRecordId }
            }) {
              __typename
              id
            }
          }
        `),
      ),
    );
  });
});
