import { gql } from '@apollo/client';
import { APPLICATION_FRAGMENT } from '@/applications/graphql/fragments/applicationFragment';

export const FIND_ONE_APPLICATION = gql`
  ${APPLICATION_FRAGMENT}
  query FindOneApplication($id: UUID!) {
    findOneApplication(id: $id) {
      ...ApplicationFields
    }
  }
`;
