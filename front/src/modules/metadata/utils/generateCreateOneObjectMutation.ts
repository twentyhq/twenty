import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { MetadataObject } from '../types/MetadataObject';

export const generateCreateOneObjectMutation = ({
  metadataObject,
}: {
  metadataObject: MetadataObject;
}) => {
  return gql`
    mutation CreateOne${metadataObject.nameSingular}($input: ${capitalize(
    metadataObject.nameSingular,
  )}CreateInput!)  {
      createOne${metadataObject.nameSingular}(data: $input) {
        id
      }
    }
  `;
};
