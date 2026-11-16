import { gql } from '@apollo/client';

import { APPLICATION_CONTENT_FRAGMENT } from '@/applications/graphql/fragments/applicationContentFragment';

export const FIND_ONE_APPLICATION_CONTENT = gql`
  ${APPLICATION_CONTENT_FRAGMENT}
  query FindOneApplicationContent($id: UUID, $universalIdentifier: UUID) {
    findOneApplication(id: $id, universalIdentifier: $universalIdentifier) {
      id
      universalIdentifier
      name
      logoUrl
      content {
        ...ApplicationContentFields
      }
    }
  }
`;
