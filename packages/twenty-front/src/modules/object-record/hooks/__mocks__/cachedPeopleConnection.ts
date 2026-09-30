import { gql } from '@apollo/client';

export const CACHED_PEOPLE_CONNECTION_QUERY = gql`
  query FindManyPeople {
    people {
      __typename
      edges {
        __typename
        node {
          __typename
          id
        }
        cursor
      }
      totalCount
    }
  }
`;

const CACHED_PERSON_IDS = [
  '20202020-0000-4000-8000-000000000001',
  '20202020-0000-4000-8000-000000000002',
];

export const CACHED_PEOPLE_CONNECTION = {
  people: {
    __typename: 'PersonConnection',
    edges: CACHED_PERSON_IDS.map((personId) => ({
      __typename: 'PersonEdge',
      node: { __typename: 'Person', id: personId },
      cursor: '',
    })),
    totalCount: CACHED_PERSON_IDS.length,
  },
};
