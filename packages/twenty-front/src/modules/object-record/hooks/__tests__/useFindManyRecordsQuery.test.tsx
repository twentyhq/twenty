import { renderHook } from '@testing-library/react';
import { print } from 'graphql';
import { RecoilRoot } from 'recoil';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';

const expectedQueryTemplate = `
  query FindManyPeople($filter: PersonFilterInput, $orderBy: [PersonOrderByInput], $lastCursor: String, $limit: Int) {
    people(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor) {
      edges {
        node {
      ${PERSON_FRAGMENT}
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
