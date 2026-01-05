import { gql } from '@apollo/client';

import { SKILL_FRAGMENT } from '@/ai/graphql/fragments/skillFragment';

export const CREATE_SKILL = gql`
  ${SKILL_FRAGMENT}
  mutation CreateSkill($input: CreateSkillInput!) {
    createSkill(input: $input) {
      ...SkillFields
    }
  }
`;
