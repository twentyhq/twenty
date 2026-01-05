import { gql } from '@apollo/client';

import { SKILL_FRAGMENT } from '@/ai/graphql/fragments/skillFragment';

export const ACTIVATE_SKILL = gql`
  ${SKILL_FRAGMENT}
  mutation ActivateSkill($id: UUID!) {
    activateSkill(id: $id) {
      ...SkillFields
    }
  }
`;
