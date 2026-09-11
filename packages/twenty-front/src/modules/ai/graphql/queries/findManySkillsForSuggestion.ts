import { gql } from '@apollo/client';

export const FIND_MANY_SKILLS_FOR_SUGGESTION = gql`
  query FindManySkillsForSuggestion {
    skills {
      id
      name
      label
      description
      icon
      isActive
    }
  }
`;
