import { useApolloClient } from '@apollo/client/react/hooks/useApolloClient';
import gql from 'graphql-tag';

import { useMapFieldMetadataToGraphQLQuery } from '@/object-metadata/hooks/useMapFieldMetadataToGraphQLQuery';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { QueryMethodName } from '@/object-metadata/types/QueryMethodName';

export const useCachedRootQuery = ({
  objectMetadataItem,
  queryMethodName,
}: {
  objectMetadataItem: ObjectMetadataItem | undefined;
  queryMethodName: QueryMethodName;
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
        QueryMethodName.FindMany === queryMethodName
          ? objectMetadataItem.namePlural
          : objectMetadataItem.nameSingular
      } {
        ${QueryMethodName.FindMany === queryMethodName ? 'edges { node { ' : ''}
            ${buildRecordFieldsFragment()}
        ${QueryMethodName.FindMany === queryMethodName ? '}}' : ''}

      }
    }
  `;

  const cachedRootQuery = apolloClient.readFragment({
    id: 'ROOT_QUERY',
    fragment: cacheReadFragment,
  });

  return { cachedRootQuery };
};
