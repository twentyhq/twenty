import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { MetadataObject } from '../types/MetadataObject';

export const generateUpdateOneObjectMutation = ({
  metadataObject,
}: {
  metadataObject: MetadataObject;
}) => {
  const capitalizedObjectName = capitalize(metadataObject.nameSingular);

  return gql`
    mutation UpdateOne${capitalizedObjectName}($idToUpdate: ID!, $input: ${capitalizedObjectName}UpdateInput!)  {
       updateOne${capitalizedObjectName}(id: $idToUpdate, data: $input) {
        id
      }
    }
  `;
};
