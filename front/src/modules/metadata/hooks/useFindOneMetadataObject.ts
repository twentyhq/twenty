import { gql } from '@apollo/client';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { formatMetadataFieldAsColumnDefinition } from '../utils/formatMetadataFieldAsColumnDefinition';
import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';
import { generateFindManyCustomObjectsQuery } from '../utils/generateFindManyCustomObjectsQuery';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useFindOneMetadataObject = ({
  objectNamePlural,
}: MetadataObjectIdentifier) => {
  const { metadataObjects, loading } = useFindManyMetadataObjects();

  const foundMetadataObject = metadataObjects.find(
    (object) => object.namePlural === objectNamePlural,
  );

  const objectNotFoundInMetadata =
    metadataObjects.length === 0 ||
    (metadataObjects.length > 0 && !foundMetadataObject);

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    foundMetadataObject?.fields.map((field, index) =>
      formatMetadataFieldAsColumnDefinition({
        index,
        field,
      }),
    ) ?? [];

  // eslint-disable-next-line no-console
  console.log({
    foundMetadataObject,
    columnDefinitions,
  });

  const findManyQuery = foundMetadataObject
    ? generateFindManyCustomObjectsQuery({
        metadataObject: foundMetadataObject,
      })
    : gql`
        query EmptyQuery {
          empty
        }
      `;

  const createOneMutation = foundMetadataObject
    ? generateCreateOneObjectMutation({
        metadataObject: foundMetadataObject,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  // TODO: implement backend delete
  const deleteOneMutation = foundMetadataObject
    ? generateCreateOneObjectMutation({
        metadataObject: foundMetadataObject,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  return {
    foundMetadataObject,
    objectNotFoundInMetadata,
    columnDefinitions,
    findManyQuery,
    createOneMutation,
    deleteOneMutation,
    loading,
  };
};
