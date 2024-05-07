import { gql } from '@apollo/client';
import { mockedPeopleData } from '~/testing/mock-data/people';

export const query = gql`
  query FindDuplicatePerson($id: UUID) {
    personDuplicates(id: $id) {
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
`;

export const variables = {
  id: '6205681e-7c11-40b4-9e32-f523dbe54590',
};

export const responseData = {
  personDuplicates: {
    edges: [
      {
        node: { __typename: 'Person', ...mockedPeopleData[0], updatedAt: '' },
        cursor: 'cursor1',
      },
      {
        node: { __typename: 'Person', ...mockedPeopleData[1], updatedAt: '' },
        cursor: 'cursor2',
      },
    ],
    pageInfo: {
      hasNextPage: false,
      startCursor: 'cursor1',
      endCursor: 'cursor2',
    },
    totalCount: 2,
  },
};
