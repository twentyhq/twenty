import { gql } from '@apollo/client';

import { capitalize } from '~/utils/string/capitalize';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

// TODO: implement
export const generateDeleteOneObjectMutation = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  return gql`
    mutation DeleteOne${capitalizedObjectName}($input: ${capitalizedObjectName}DeleteInput!)  {
      createOne${capitalizedObjectName}(data: $input) {
        id
      }
    }
  `;
};
