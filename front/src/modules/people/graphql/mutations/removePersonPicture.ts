import { gql } from '@apollo/client';

export const REMOVE_PERSON_PICTURE = gql`
  mutation RemovePersonPicture($where: PersonWhereUniqueInput!) {
    updateOnePerson(data: { avatarUrl: null }, where: $where) {
      id
      avatarUrl
    }
  }
`;
