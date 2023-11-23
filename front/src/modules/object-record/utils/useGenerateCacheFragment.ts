import { gql } from '@apollo/client';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateCacheFragment = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem | undefined | null;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();

  if (!objectMetadataItem) {
    return EMPTY_MUTATION;
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  return gql`
  fragment ${capitalizedObjectName}Fragment on ${capitalizedObjectName} {
    id
    ${objectMetadataItem.fields
      .map((field) => mapFieldMetadataToGraphQLQuery(field))
      .join('\n')}
  }
`;
};
