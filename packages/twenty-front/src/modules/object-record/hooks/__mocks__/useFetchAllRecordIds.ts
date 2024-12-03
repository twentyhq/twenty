import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { gql } from '@apollo/client';

import { peopleQueryResult } from '~/testing/mock-data/people';

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

export const peopleMockWithIdsOnly: RecordGqlConnection = {
  ...peopleQueryResult.people,
  edges: peopleQueryResult.people.edges.map((edge) => ({
    ...edge,
    node: { __typename: 'Person', id: edge.node.id },
  })),
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
  response: RecordGqlConnection,
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
    } satisfies RecordGqlConnection['pageInfo'],
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
