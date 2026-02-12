import { gql } from '@apollo/client';

import { SKILL_FRAGMENT } from '@/ai/graphql/fragments/skillFragment';

export const DEACTIVATE_SKILL = gql`
  ${SKILL_FRAGMENT}
  mutation DeactivateSkill($id: UUID!) {
    deactivateSkill(id: $id) {
      ...SkillFields
    }
  }
`;
