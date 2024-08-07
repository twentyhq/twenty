import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';

const expectedQueryTemplate = `
  query FindManyPeople($filter: PersonFilterInput, $orderBy: [PersonOrderByInput], $lastCursor: String, $limit: Int) {
    people(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor) {
      edges {
        node {
          __typename
          updatedAt
          myCustomObjectId
          whatsapp
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          name {
            firstName
            lastName
          }
          email
          position
          createdBy {
            source
            workspaceMemberId
            name
          }
          avatarUrl
          jobTitle
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          performanceRating
          createdAt
          phone
          id
          city
          companyId
          intro
          workPrefereance
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
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
    const computeReferences = true;

    const { result } = renderHook(
      () =>
        useFindManyRecordsQuery({
          objectNameSingular,
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
