import { useApolloClient } from '@apollo/client/react/hooks/useApolloClient';
import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { QueryMethodName } from '@/object-metadata/types/QueryMethodName';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';

export const useCachedRootQuery = ({
  objectMetadataItem,
  queryMethodName,
}: {
  objectMetadataItem: ObjectMetadataItem | undefined;
  queryMethodName: QueryMethodName;
}) => {
  const apolloClient = useApolloClient();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState());

  if (!objectMetadataItem) {
    return { cachedRootQuery: null };
  }

  const cacheReadFragment = gql`
    fragment RootQuery on Query {
      ${
        QueryMethodName.FindMany === queryMethodName
          ? objectMetadataItem.namePlural
          : objectMetadataItem.nameSingular
      }
        ${QueryMethodName.FindMany === queryMethodName ? '{ edges { node ' : ''}
            ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems,
              objectMetadataItem,
              depth: 0,
            })}
            ${QueryMethodName.FindMany === queryMethodName ? '}}' : ''}
        }
  `;

  const cachedRootQuery = apolloClient.readFragment({
    id: 'ROOT_QUERY',
    fragment: cacheReadFragment,
  });

  return { cachedRootQuery };
};
