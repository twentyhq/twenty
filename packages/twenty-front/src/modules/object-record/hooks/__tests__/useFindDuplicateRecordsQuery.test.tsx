import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useFindDuplicateRecordsQuery } from '@/object-record/hooks/useFindDuplicatesRecordsQuery';

const expectedQueryTemplate = `
  query FindDuplicatePerson($ids: [ID!]!) {
    personDuplicates(ids: $ids) {
      edges {
        node {
          __typename
          xLink {
            label
            url
          }
          id
          createdAt
          city
          email
          jobTitle
          name {
            firstName
            lastName
          }
          phone
          linkedinLink {
            label
            url
          }
         updatedAt
          avatarUrl
          companyId
        }
       cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
     }
    }
`.replace(/\s/g, '');

describe('useFindDuplicateRecordsQuery', () => {
  it('should return a valid findDuplicateRecordsQuery', () => {
    const objectNameSingular = 'person';

    const { result } = renderHook(
      () =>
        useFindDuplicateRecordsQuery({
          objectNameSingular,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { findDuplicateRecordsQuery } = result.current;

    expect(findDuplicateRecordsQuery).toBeDefined();

    const printedReceivedQuery = print(findDuplicateRecordsQuery).replace(
      /\s/g,
      '',
    );

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
