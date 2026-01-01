import { gql } from '@apollo/client';

export const DELETE_SKILL = gql`
  mutation DeleteSkill($id: UUID!) {
    deleteSkill(id: $id)
  }
`;

