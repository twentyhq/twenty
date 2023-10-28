import { gql } from '@apollo/client';

import { ColumnDefinition } from '@/ui/data/data-table/types/ColumnDefinition';
import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { formatMetadataFieldAsColumnDefinition } from '../utils/formatMetadataFieldAsColumnDefinition';
import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';
import { generateFindManyCustomObjectsQuery } from '../utils/generateFindManyCustomObjectsQuery';
import { generateFindOneCustomObjectQuery } from '../utils/generateFindOneCustomObjectQuery';
import { generateUpdateOneObjectMutation } from '../utils/generateUpdateOneObjectMutation';

import { useFindManyMetadataObjects } from './useFindManyMetadataObjects';

export const useFindOneMetadataObject = ({
  objectNamePlural,
  objectNameSingular,
}: MetadataObjectIdentifier) => {
  const { metadataObjects, loading } = useFindManyMetadataObjects();

  const foundMetadataObject = metadataObjects.find(
    (object) =>
      object.namePlural === objectNamePlural ||
      object.nameSingular === objectNameSingular,
  );

  const objectNotFoundInMetadata =
    metadataObjects.length === 0 ||
    (metadataObjects.length > 0 && !foundMetadataObject);

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    foundMetadataObject?.fields.map((field, index) =>
      formatMetadataFieldAsColumnDefinition({
        position: index,
        field,
        metadataObject: foundMetadataObject,
      }),
    ) ?? [];

  const findManyQuery = foundMetadataObject
    ? generateFindManyCustomObjectsQuery({
        metadataObject: foundMetadataObject,
      })
    : gql`
        query EmptyQuery {
          empty
        }
      `;

  const findOneQuery = foundMetadataObject
    ? generateFindOneCustomObjectQuery({
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

  const updateOneMutation = foundMetadataObject
    ? generateUpdateOneObjectMutation({
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
    findOneQuery,
    createOneMutation,
    updateOneMutation,
    deleteOneMutation,
    loading,
  };
};
