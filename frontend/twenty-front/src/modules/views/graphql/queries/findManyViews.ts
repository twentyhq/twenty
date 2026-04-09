import { VIEW_FRAGMENT } from '@/views/graphql/fragments/viewFragment';
import { gql } from '@apollo/client';

export const FIND_MANY_VIEWS = gql`
  ${VIEW_FRAGMENT}
  query FindManyViews($objectMetadataId: String, $viewTypes: [ViewType!]) {
    getViews(objectMetadataId: $objectMetadataId, viewTypes: $viewTypes) {
      ...ViewFragment
    }
  }
`;
