import { gql } from '@apollo/client';

export const TIMELINE_ACTIVITY_RULE_FRAGMENT = gql`
  fragment TimelineActivityRuleFragment on TimelineActivityRule {
    id
    objectMetadataId
    relationFieldMetadataId
    resolution
    actions
    triggerFieldMetadataIds
    isActive
    isStandard
    isOverridden
  }
`;
