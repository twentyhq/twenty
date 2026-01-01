import { gql } from '@apollo/client';

import { SKILL_FRAGMENT } from '@/ai/graphql/fragments/skillFragment';

export const UPDATE_SKILL = gql`
  ${SKILL_FRAGMENT}
  mutation UpdateSkill($input: UpdateSkillInput!) {
    updateSkill(input: $input) {
      ...SkillFields
    }
  }
`;
