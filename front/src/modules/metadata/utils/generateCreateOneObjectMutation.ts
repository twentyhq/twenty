import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const generateCreateOneObjectMutation = ({
  ObjectMetadataItem,
}: {
  ObjectMetadataItem: ObjectMetadataItem;
}) => {
  const capitalizedObjectName = capitalize(ObjectMetadataItem.nameSingular);

  return gql`
    mutation CreateOne${capitalizedObjectName}($input: ${capitalizedObjectName}CreateInput!)  {
      createOne${capitalizedObjectName}(data: $input) {
        id
      }
    }
  `;
};
