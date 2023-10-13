import { gql, useQuery } from '@apollo/client';
import { useRecoilState } from 'recoil';

import { metadataObjectsState } from '../states/metadataObjectsState';
import { MetadataObject } from '../types/MetadataObject';

export const generateFindManyCustomObjectsQuery = ({
  metadataObject,
  fromCursor,
}: {
  metadataObject: MetadataObject;
  fromCursor?: string;
}) => {
  return gql`
    query CustomQuery${metadataObject.displayNameSingular} {
      findMany${metadataObject.displayNameSingular}{
        edges {
          node {
            id
            ${metadataObject.fields
              .map((field) => field.displayName)
              .join('\n')}
          }
          cursor
        }
      }
    }
  `;
};

// TODO: add zod to validate that we have at least id on each object
export const useFindManyObjects = ({ objectName }: { objectName: string }) => {
  const [metadataObjects] = useRecoilState(metadataObjectsState);

  const foundObject = metadataObjects.find(
    (object) => object.displayName === objectName,
  );

  // eslint-disable-next-line no-console
  console.log({ foundObject });

  const generatedQuery = foundObject
    ? generateFindManyCustomObjectsQuery({
        metadataObject: foundObject,
      })
    : gql`
        query EmptyQuery {
          empty
        }
      `;

  const {
    fetchMore: fetchMoreBase,
    data,
    loading,
    error,
  } = useQuery(generatedQuery, {
    skip: !foundObject,
  });

  // eslint-disable-next-line no-console
  console.log({ data, loading, error });

  const fetchMore = ({ fromCursor }: { fromCursor: string }) => {
    fetchMoreBase({
      variables: { fromCursor },
    });
  };

  const objectNotFoundInMetadata = metadataObjects.length > 0 && !foundObject;

  return {
    data,
    loading,
    error,
    fetchMore,
    objectNotFoundInMetadata,
  };
};
