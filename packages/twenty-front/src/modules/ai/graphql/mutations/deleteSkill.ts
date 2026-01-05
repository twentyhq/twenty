import { gql } from '@apollo/client';

import { SKILL_FRAGMENT } from '@/ai/graphql/fragments/skillFragment';

export const DELETE_SKILL = gql`
  ${SKILL_FRAGMENT}
  mutation DeleteSkill($id: UUID!) {
    deleteSkill(id: $id) {
      ...SkillFields
    }
  }
`;
