import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type RestoreOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  recordId: string;
};

export const restoreOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  recordId,
}: RestoreOneOperationFactoryParams) => ({
  query: gql`
    mutation Restore${capitalize(objectMetadataSingularName)}($${objectMetadataSingularName}Id: UUID!) {
      restore${capitalize(objectMetadataSingularName)}(id: $${objectMetadataSingularName}Id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    [`${objectMetadataSingularName}Id`]: recordId,
  },
});
