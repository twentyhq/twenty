import { gql } from '@apollo/client';

export const SKILL_FRAGMENT = gql`
  fragment SkillFields on Skill {
    id
    name
    label
    description
    icon
    content
    isCustom
    isActive
    createdAt
    updatedAt
  }
`;
