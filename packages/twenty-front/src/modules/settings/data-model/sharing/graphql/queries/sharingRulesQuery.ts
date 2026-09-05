import { gql } from '@apollo/client';

import { SHARING_RULE_FRAGMENT } from '@/settings/data-model/sharing/graphql/fragments/sharingRuleFragment';

export const SHARING_RULES = gql`
  ${SHARING_RULE_FRAGMENT}
  query SharingRules($objectMetadataId: UUID!) {
    sharingRules(objectMetadataId: $objectMetadataId) {
      ...SharingRuleFields
    }
  }
`;
