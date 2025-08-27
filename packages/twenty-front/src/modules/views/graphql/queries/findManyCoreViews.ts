import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_CORE_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindManyCoreViews($objectMetadataId: String) {
    getCoreViews(objectMetadataId: $objectMetadataId) {
      ...ViewFragment
    }
  }
`;
