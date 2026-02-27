import { RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import { gql } from '@apollo/client';

import { allMockPersonRecords } from '~/testing/mock-data/people';

export const query = gql`
  query FindManyPeople(
    $filter: PersonFilterInput
    $orderBy: [PersonOrderByInput]
    $lastCursor: String
    $limit: Int
  ) {
    people(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          id
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
`;

export const mockPageSize = 2;

const peopleMockEdges = allMockPersonRecords.map((record, index) => ({
  node: { __typename: 'Person' as const, id: record.id },
  cursor: `cursor-${index}`,
  __typename: 'PersonEdge' as const,
}));

export const peopleMockWithIdsOnly: RecordGqlConnectionEdgesRequired = {
  __typename: 'PersonConnection',
  edges: peopleMockEdges,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: peopleMockEdges[0]?.cursor ?? '',
    endCursor: peopleMockEdges[peopleMockEdges.length - 1]?.cursor ?? '',
  },
  totalCount: allMockPersonRecords.length,
};

export const firstRequestLastCursor =
  peopleMockWithIdsOnly.edges[mockPageSize].cursor;
export const secondRequestLastCursor =
  peopleMockWithIdsOnly.edges[mockPageSize * 2].cursor;
export const thirdRequestLastCursor =
  peopleMockWithIdsOnly.edges[mockPageSize * 3].cursor;

export const variablesFirstRequest = {
  filter: undefined,
  limit: mockPageSize,
  orderBy: undefined,
};

export const variablesSecondRequest = {
  filter: undefined,
  limit: mockPageSize,
  orderBy: undefined,
  lastCursor: firstRequestLastCursor,
};

export const variablesThirdRequest = {
  filter: undefined,
  limit: mockPageSize,
  orderBy: undefined,
  lastCursor: secondRequestLastCursor,
};

const paginateRequestResponse = (
  response: RecordGqlConnectionEdgesRequired,
  start: number,
  end: number,
  hasNextPage: boolean,
  totalCount: number,
) => {
  return {
    ...response,
    edges: [...response.edges.slice(start, end)],
    pageInfo: {
      ...response.pageInfo,
      startCursor: response.edges[start].cursor,
      endCursor: response.edges[end].cursor,
      hasNextPage,
    } satisfies RecordGqlConnectionEdgesRequired['pageInfo'],
    totalCount,
  };
};

export const responseFirstRequest = {
  people: paginateRequestResponse(
    peopleMockWithIdsOnly,
    0,
    mockPageSize,
    true,
    6,
  ),
};

export const responseSecondRequest = {
  people: paginateRequestResponse(
    peopleMockWithIdsOnly,
    mockPageSize,
    mockPageSize * 2,
    true,
    6,
  ),
};

export const responseThirdRequest = {
  people: paginateRequestResponse(
    peopleMockWithIdsOnly,
    mockPageSize * 2,
    mockPageSize * 3,
    false,
    6,
  ),
};
