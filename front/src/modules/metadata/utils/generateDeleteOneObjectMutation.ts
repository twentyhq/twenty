import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { MetadataObject } from '../types/MetadataObject';

// TODO: implement
export const generateDeleteOneObjectMutation = ({
  metadataObject,
}: {
  metadataObject: MetadataObject;
}) => {
  const capitalizedObjectName = capitalize(metadataObject.nameSingular);

  return gql`
    mutation DeleteOne${capitalizedObjectName}($input: ${capitalizedObjectName}DeleteInput!)  {
      createOne${capitalizedObjectName}(data: $input) {
        id
      }
    }
  `;
};
