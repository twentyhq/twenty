import { PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { gql } from '@apollo/client';
import { getPeopleRecordConnectionMock } from '~/testing/mock-data/people';

const peopleMock = getPeopleRecordConnectionMock();

export const query = gql`
  query FindDuplicatePerson($ids: [UUID!]!) {
    personDuplicates(ids: $ids) {
      edges {
        node {
          ${PERSON_FRAGMENT_WITH_DEPTH_ZERO_RELATIONS}
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
