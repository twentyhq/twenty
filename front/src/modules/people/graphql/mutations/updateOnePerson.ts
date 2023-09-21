import { gql } from '@apollo/client';

export const UPDATE_ONE_PERSON = gql`
  mutation UpdateOnePerson(
    $where: PersonWhereUniqueInput!
    $data: PersonUpdateInput!
  ) {
    updateOnePerson(data: $data, where: $where) {
      ...personFieldsFragment
    }
  }
`;
