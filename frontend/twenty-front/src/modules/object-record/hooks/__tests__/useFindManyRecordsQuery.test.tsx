import { renderHook } from '@testing-library/react';

import { PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { print } from 'graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const expectedQueryTemplate = `
  query FindManyPeople($filter: PersonFilterInput, $orderBy: [PersonOrderByInput], $lastCursor: String, $limit: Int, $offset: Int) {
    people(
      filter: $filter 
      orderBy: $orderBy 
      first: $limit 
      after: $lastCursor 
      offset: $offset
    ) {
      edges {
        node {
      ${PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS}
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

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

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
        wrapper: Wrapper,
      },
    );

    const { findManyRecordsQuery } = result.current;

    expect(findManyRecordsQuery).toBeDefined();

    const printedReceivedQuery = print(findManyRecordsQuery).replace(/\s/g, '');

    expect(printedReceivedQuery).toEqual(expectedQueryTemplate);
  });
});
