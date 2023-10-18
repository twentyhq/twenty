import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import { isFlexibleBackendEnabledState } from '@/client-config/states/isFlexibleBackendEnabledState';
import { MetadataObjectsQuery } from '~/generated-metadata/graphql';

import { FIND_MANY_METADATA_OBJECTS } from '../graphql/queries';
import { useApolloMetadataClient } from '../hooks/useApolloMetadataClient';
import { useCreateOneObject } from '../hooks/useCreateOneObject';
import { useFindManyObjects } from '../hooks/useFindManyObjects';
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

  const { createOneObject } = useCreateOneObject({
    objectNamePlural: 'suppliers',
  });

  const { objects: suppliers, loading } = useFindManyObjects({
    objectNamePlural: 'suppliers',
  });

  const [created, setCreated] = useState(false);

  useEffect(() => {
    if (!created && !loading && suppliers.length === 0 && createOneObject) {
      createOneObject({
        name: 'Supplier 1',
        city: 'City 1',
      });

      createOneObject({
        name: 'Supplier 2',
        city: 'City 2',
      });

      createOneObject({
        name: 'Supplier 3',
        city: 'City 3',
      });

      setCreated(true);
    }
  }, [suppliers, createOneObject, loading, created]);

  useEffect(() => {
    if (!isFlexibleBackendEnabled) return;

    (async () => {
      if (apolloMetadataClient && metadataObjects.length === 0) {
        const objects = await apolloMetadataClient.query<MetadataObjectsQuery>({
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
              await apolloMetadataClient.query<MetadataObjectsQuery>({
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
    apolloMetadataClient,
    seedCustomObjectsTemp,
  ]);

  return <></>;
};
