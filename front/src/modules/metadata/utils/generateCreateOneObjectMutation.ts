import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { MetadataObject } from '../types/MetadataObject';

export const generateCreateOneObjectMutation = ({
  metadataObject,
}: {
  metadataObject: MetadataObject;
}) => {
  const capitalizedObjectName = capitalize(metadataObject.nameSingular);

  return gql`
    mutation CreateOne${capitalizedObjectName}($input: ${capitalizedObjectName}CreateInput!)  {
      createOne${capitalizedObjectName}(data: $input) {
        id
      }
    }
  `;
};
