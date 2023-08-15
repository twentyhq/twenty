import { gql } from '@apollo/client';

export const GET_PERSON_NAMES_AND_COMMENT_COUNT = gql`
  query GetPersonNamesAndCommentCountById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      firstName
      lastName
      displayName
      _activityCount
    }
  }
`;
