import { useApolloClient } from '@apollo/client/react/hooks/useApolloClient';
import gql from 'graphql-tag';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useCachedRootQuery = ({
  objectMetadataItem,
  isArrayOfRecords,
}: {
  objectMetadataItem: ObjectMetadataItem | undefined;
  isArrayOfRecords: boolean;
}) => {
  const mapFieldMetadataToGraphQLQuery = useMapFieldMetadataToGraphQLQuery();
  const apolloClient = useApolloClient();

  if (!objectMetadataItem) {
    return { cachedRootQuery: null };
  }

  const buildRecordFieldsFragment = () => {
    return objectMetadataItem.fields
      .filter((field) => field.type !== 'RELATION')
      .map((field) => mapFieldMetadataToGraphQLQuery(field))
      .join(' \n');
  };

  const cacheReadFragment = gql`
    fragment RootQuery on Query {
      ${
        isArrayOfRecords
          ? objectMetadataItem.namePlural
          : objectMetadataItem.nameSingular
      } {
        ${isArrayOfRecords ? 'edges { node { ' : ''}
            ${buildRecordFieldsFragment()}
        ${isArrayOfRecords ? '}}' : ''}

      }
    }
  `;

  const cachedRootQuery = apolloClient.readFragment({
    id: 'ROOT_QUERY',
    fragment: cacheReadFragment,
  });

  return { cachedRootQuery };
};
