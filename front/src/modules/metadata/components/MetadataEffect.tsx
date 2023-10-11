import { useEffect } from 'react';
import { useApolloClient } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { ObjectsQuery } from '~/generated-metadata/graphql';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

import { GET_ALL_OBJECTS } from '../graphql/queries';
import { metadataObjectsState } from '../states/metadataObjectsState';
import { MetadataObject } from '../types/MetadataObject';

type MetadataProviderProps = {
  children: React.ReactNode;
};

export const MetadataEffect = () => {
  const apolloClient = useApolloClient();

  const [metadataObjects, setMetadataObjects] =
    useRecoilState(metadataObjectsState);

  useEffect(() => {
    (async () => {
      if (!isNonEmptyArray(metadataObjects)) {
        const objects = await apolloClient.query<ObjectsQuery>({
          query: GET_ALL_OBJECTS,
          context: {
            customURI: `${process.env.REACT_APP_SERVER_BASE_URL}/metadata`,
          },
        });

        // eslint-disable-next-line no-console
        console.debug({ objects });

        if (objects.data.objects.edges.length === 0) {
          throw new Error(`No objects found in the database.`);
        }

        const formattedObjects: MetadataObject[] =
          objects.data.objects.edges.map((object) => ({
            ...object.node,
            fields: object.node.fields.edges.map((field) => field.node),
          }));

        setMetadataObjects(formattedObjects);
      }
    })();
  }, [apolloClient, metadataObjects, setMetadataObjects]);

  return <></>;
};
