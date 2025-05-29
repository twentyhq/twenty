import { mockPersonObjectMetadata } from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonObjectMetadata';
import { buildDuplicateConditions } from 'src/engine/api/utils/build-duplicate-conditions.utils';
import { mockPersonRecords } from 'src/engine/api/graphql/graphql-query-runner/__mocks__/mockPersonRecords';

describe('buildDuplicateConditions', () => {
  it('should build conditions based on duplicate criteria from composite field', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonObjectMetadata([['emailsPrimaryEmail']]),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          emailsPrimaryEmail: {
            eq: 'test@test.fr',
          },
        },
      ],
      id: {
        neq: 'recordId',
      },
    });
  });

  it('should build conditions based on duplicate criteria from basic field', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonObjectMetadata([['jobTitle']]),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          jobTitle: {
            eq: 'Test job',
          },
        },
      ],
      id: {
        neq: 'recordId',
      },
    });
  });

  it('should not build conditions based on duplicate criteria if record value is null or too small', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonObjectMetadata([['linkedinLinkPrimaryLinkUrl']]),
      mockPersonRecords,
      'recordId',
    );

    expect(duplicateConditons).toEqual({});
  });

  it('should build conditions based on duplicate criteria and without recordId filter', () => {
    const duplicateConditons = buildDuplicateConditions(
      mockPersonObjectMetadata([['jobTitle']]),
      mockPersonRecords,
    );

    expect(duplicateConditons).toEqual({
      or: [
        {
          jobTitle: {
            eq: 'Test job',
          },
        },
      ],
    });
  });
});
