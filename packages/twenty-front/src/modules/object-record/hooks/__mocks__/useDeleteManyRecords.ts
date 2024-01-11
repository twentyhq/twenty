import { gql } from '@apollo/client';

export const query = gql`
  mutation DeleteManyPeople($filter: PersonFilterInput!) {
    deletePeople(filter: $filter) {
      id
    }
  }
`;

export const variables = {
  filter: {
    id: {
      in: [
        'a7286b9a-c039-4a89-9567-2dfa7953cda9',
        '37faabcd-cb39-4a0a-8618-7e3fda9afca0',
      ],
    },
  },
};

export const responseData = {
  id: '',
};
