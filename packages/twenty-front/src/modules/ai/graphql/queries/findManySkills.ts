import { gql } from '@apollo/client';

import { SKILL_FRAGMENT } from '@/ai/graphql/fragments/skillFragment';

export const FIND_MANY_SKILLS = gql`
  ${SKILL_FRAGMENT}
  query FindManySkills {
    skills {
      ...SkillFields
    }
  }
`;
