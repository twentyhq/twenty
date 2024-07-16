import { gql } from '@apollo/client';
import { getPeopleMock } from '~/testing/mock-data/people';

const peopleMock = getPeopleMock();

export const query = gql`
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
`;

export const variables = {
  ids: ['6205681e-7c11-40b4-9e32-f523dbe54590'],
};

export const responseData = {
  personDuplicates: [
    {
      edges: [
        {
          node: { ...peopleMock[0], updatedAt: '' },
          cursor: 'cursor1',
        },
        {
          node: { ...peopleMock[1], updatedAt: '' },
          cursor: 'cursor2',
        },
      ],
      pageInfo: {
        hasNextPage: false,
        startCursor: 'cursor1',
        endCursor: 'cursor2',
      },
    },
  ],
};
