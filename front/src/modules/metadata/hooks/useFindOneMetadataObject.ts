import { gql } from '@apollo/client';

import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';
import { formatMetadataFieldAsColumnDefinition } from '../utils/formatMetadataFieldAsColumnDefinition';
import { formatMetadataFieldAsFilterDefinition } from '../utils/formatMetadataFieldAsFilterDefinition';
import { formatMetadataFieldAsSortDefinition } from '../utils/formatMetadataFieldAsSortDefinition';
import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';
import { generateDeleteOneObjectMutation } from '../utils/generateDeleteOneObjectMutation';
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

  const { icons } = useLazyLoadIcons();

  const objectNotFoundInMetadata =
    metadataObjects.length === 0 ||
    (metadataObjects.length > 0 && !foundMetadataObject);

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    foundMetadataObject?.fields.map((field, index) =>
      formatMetadataFieldAsColumnDefinition({
        position: index,
        field,
        metadataObject: foundMetadataObject,
        icons,
      }),
    ) ?? [];

  const filterDefinitions: FilterDefinition[] =
    foundMetadataObject?.fields.map((field) =>
      formatMetadataFieldAsFilterDefinition({
        field,
        icons,
      }),
    ) ?? [];

  const sortDefinitions: SortDefinition[] =
    foundMetadataObject?.fields.map((field) =>
      formatMetadataFieldAsSortDefinition({
        field,
        icons,
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
    ? generateDeleteOneObjectMutation({
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
    filterDefinitions,
    sortDefinitions,
    findManyQuery,
    findOneQuery,
    createOneMutation,
    updateOneMutation,
    deleteOneMutation,
    loading,
  };
};
