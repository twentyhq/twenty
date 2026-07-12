import { gql } from '@apollo/client';

import { APPLICATION_FRAGMENT } from '@/applications/graphql/fragments/applicationFragment';

export const FIND_ONE_APPLICATION_FOR_SETTINGS_APPLICATION_DETAILS = gql`
  ${APPLICATION_FRAGMENT}
  query FindOneApplicationForSettingsApplicationDetails($id: UUID!) {
    findOneApplication(id: $id) {
      ...ApplicationFields
      functionsBaseUrl
    }
  }
`;
