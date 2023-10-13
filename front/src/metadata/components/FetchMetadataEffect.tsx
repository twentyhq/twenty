import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { ObjectsQuery } from '~/generated-metadata/graphql';

import { GET_ALL_OBJECTS } from '../graphql/queries';
import { useApolloClientMetadata } from '../hooks/useApolloClientMetadata';
import { metadataObjectsState } from '../states/metadataObjectsState';
import { MetadataObject } from '../types/MetadataObject';

export const FetchMetadataEffect = () => {
  const [metadataObjects, setMetadataObjects] =
    useRecoilState(metadataObjectsState);

  const apolloClientMetadata = useApolloClientMetadata();

  useEffect(() => {
    (async () => {
      if (apolloClientMetadata) {
        const objects = await apolloClientMetadata.query<ObjectsQuery>({
          query: GET_ALL_OBJECTS,
        });

        if (
          objects.data.objects.edges.length > 0 &&
          metadataObjects.length === 0
        ) {
          const formattedObjects: MetadataObject[] =
            objects.data.objects.edges.map((object) => ({
              ...object.node,
              fields: object.node.fields.edges.map((field) => field.node),
            }));

          setMetadataObjects(formattedObjects);

          // eslint-disable-next-line no-console
          console.log({ formattedObjects });
        }
      }
    })();
  }, [metadataObjects, setMetadataObjects, apolloClientMetadata]);

  return <></>;
};
