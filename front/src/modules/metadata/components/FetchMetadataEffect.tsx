import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { isFlexibleBackendEnabledState } from '@/client-config/states/isFlexibleBackendEnabledState';
import { MetadataObjectsQuery } from '~/generated-metadata/graphql';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { useApolloClientMetadata } from '../hooks/useApolloClientMetadata';
import { useSeedCustomObjectsTemp } from '../hooks/useSeedCustomObjectsTemp';
import { metadataObjectsState } from '../states/metadataObjectsState';
import { MetadataObject } from '../types/MetadataObject';

export const FetchMetadataEffect = () => {
  const [metadataObjects, setMetadataObjects] =
    useRecoilState(metadataObjectsState);
  const [isFlexibleBackendEnabled] = useRecoilState(
    isFlexibleBackendEnabledState,
  );
  const apolloClientMetadata = useApolloClientMetadata();

  const seedCustomObjectsTemp = useSeedCustomObjectsTemp();

  useEffect(() => {
    if (!isFlexibleBackendEnabled) return;

    (async () => {
      if (apolloClientMetadata && metadataObjects.length === 0) {
        const objects = await apolloClientMetadata.query<MetadataObjectsQuery>({
          query: FIND_MANY_METADATA_OBJECTS,
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
              await apolloClientMetadata.query<MetadataObjectsQuery>({
                query: FIND_MANY_METADATA_OBJECTS,
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
    apolloClientMetadata,
    seedCustomObjectsTemp,
  ]);

  return <></>;
};
