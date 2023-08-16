import { gql } from '@apollo/client';

export const GET_PERSON_COMMENT_COUNT = gql`
  query GetPersonCommentCountById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      _activityCount
    }
  }
`;
