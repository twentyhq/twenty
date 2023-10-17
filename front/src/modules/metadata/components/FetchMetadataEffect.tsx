import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { isFlexibleBackendEnabledState } from '@/client-config/states/isFlexibleBackendEnabledState';
import { MetadataObjectsQuery } from '~/generated-metadata/graphql';

import { GET_ALL_OBJECTS } from '../graphql/queries';
import { useApolloMetadataClient } from '../hooks/useApolloClientMetadata';
import { useSeedCustomObjectsTemp } from '../hooks/useSeedCustomObjectsTemp';
import { metadataObjectsState } from '../states/metadataObjectsState';
import { MetadataObject } from '../types/MetadataObject';

export const FetchMetadataEffect = () => {
  const [metadataObjects, setMetadataObjects] =
    useRecoilState(metadataObjectsState);
  const [isFlexibleBackendEnabled] = useRecoilState(
    isFlexibleBackendEnabledState,
  );
  const apolloMetadataClient = useApolloMetadataClient();

  const seedCustomObjectsTemp = useSeedCustomObjectsTemp();

  useEffect(() => {
    if (!isFlexibleBackendEnabled) return;

    (async () => {
      if (apolloMetadataClient && metadataObjects.length === 0) {
        const objects = await apolloMetadataClient.query<MetadataObjectsQuery>({
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
        } else if (
          objects.data.objects.edges.length === 0 &&
          metadataObjects.length === 0
        ) {
          try {
            await seedCustomObjectsTemp();

            const objects =
              await apolloMetadataClient.query<MetadataObjectsQuery>({
                query: GET_ALL_OBJECTS,
              });

            const formattedObjects: MetadataObject[] =
              objects.data.objects.edges.map((object) => ({
                ...object.node,
                fields: object.node.fields.edges.map((field) => field.node),
              }));

            setMetadataObjects(formattedObjects);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
        }
      }
    })();
  }, [
    isFlexibleBackendEnabled,
    metadataObjects,
    setMetadataObjects,
    apolloMetadataClient,
    seedCustomObjectsTemp,
  ]);

  return <></>;
};
