import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';

const expectedQueryTemplate = `
  query FindManyPeople($filter: PersonFilterInput, $orderBy: PersonOrderByInput, $lastCursor: String, $limit: Float) {
    people(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor) {
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
      totalCount
    }
  }
`.replace(/\s/g, '');

describe('useFindManyRecordsQuery', () => {
  it('should return a valid findManyRecordsQuery', () => {
    const objectNameSingular = 'person';
    const depth = 2;
    const computeReferences = true;

    const { result } = renderHook(
      () =>
        useFindManyRecordsQuery({
          objectNameSingular,
          depth,
          computeReferences,
        }),
      {
        wrapper: RecoilRoot,
      },
    );

    const { findManyRecordsQuery } = result.current;

    expect(findManyRecordsQuery).toBeDefined();

    const printedReceivedQuery = print(findManyRecordsQuery).replace(/\s/g, '');

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
