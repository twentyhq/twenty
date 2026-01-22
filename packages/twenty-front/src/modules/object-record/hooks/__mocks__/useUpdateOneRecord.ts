import { gql } from '@apollo/client';

// Minimal fragment: only includes id and the fields being updated
export const PERSON_MINIMAL_UPDATE_NAME_FRAGMENT = `
      __typename
      id
      name {
        firstName
        lastName
      }
`;

export const query = gql`
  mutation UpdateOnePerson($idToUpdate: UUID!, $input: PersonUpdateInput!) {
    updatePerson(id: $idToUpdate, data: $input) {
      ${PERSON_MINIMAL_UPDATE_NAME_FRAGMENT}
    }
  }
`;

export const variables = {
  idToUpdate: '36abbb63-34ed-4a16-89f5-f549ac55d0f9',
  input: {
    name: { firstName: 'John', lastName: 'Doe' },
  },
};

// Response only includes id and the updated name field
export const responseData = {
  __typename: 'Person',
  id: '36abbb63-34ed-4a16-89f5-f549ac55d0f9',
  name: {
    firstName: 'John',
    lastName: 'Doe',
  },
};
