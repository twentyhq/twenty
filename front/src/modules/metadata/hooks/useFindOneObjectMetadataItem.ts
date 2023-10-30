import { gql } from '@apollo/client';

import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';
import { formatMetadataFieldAsColumnDefinition } from '../utils/formatMetadataFieldAsColumnDefinition';
import { formatMetadataFieldAsFilterDefinition } from '../utils/formatMetadataFieldAsFilterDefinition';
import { formatMetadataFieldAsSortDefinition } from '../utils/formatMetadataFieldAsSortDefinition';
import { generateCreateOneObjectMutation } from '../utils/generateCreateOneObjectMutation';
import { generateDeleteOneObjectMutation } from '../utils/generateDeleteOneObjectMutation';
import { generateFindManyCustomObjectsQuery } from '../utils/generateFindManyCustomObjectsQuery';
import { generateFindOneCustomObjectQuery } from '../utils/generateFindOneCustomObjectQuery';
import { generateUpdateOneObjectMutation } from '../utils/generateUpdateOneObjectMutation';

import { useFindManyObjectMetadataItems } from './useFindManyObjectMetadataItems';

export const useFindOneObjectMetadataItem = ({
  objectNamePlural,
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { ObjectMetadataItems, loading } = useFindManyObjectMetadataItems();

  const foundObjectMetadataItem = ObjectMetadataItems.find(
    (object) =>
      object.namePlural === objectNamePlural ||
      object.nameSingular === objectNameSingular,
  );

  const { icons } = useLazyLoadIcons();

  const objectNotFoundInMetadata =
    ObjectMetadataItems.length === 0 ||
    (ObjectMetadataItems.length > 0 && !foundObjectMetadataItem);

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    foundObjectMetadataItem?.fields.map((field, index) =>
      formatMetadataFieldAsColumnDefinition({
        position: index,
        field,
        ObjectMetadataItem: foundObjectMetadataItem,
        icons,
      }),
    ) ?? [];

  const filterDefinitions: FilterDefinition[] =
    foundObjectMetadataItem?.fields.map((field) =>
      formatMetadataFieldAsFilterDefinition({
        field,
        icons,
      }),
    ) ?? [];

  const sortDefinitions: SortDefinition[] =
    foundObjectMetadataItem?.fields.map((field) =>
      formatMetadataFieldAsSortDefinition({
        field,
        icons,
      }),
    ) ?? [];

  const findManyQuery = foundObjectMetadataItem
    ? generateFindManyCustomObjectsQuery({
        ObjectMetadataItem: foundObjectMetadataItem,
      })
    : gql`
        query EmptyQuery {
          empty
        }
      `;

  const findOneQuery = foundObjectMetadataItem
    ? generateFindOneCustomObjectQuery({
        ObjectMetadataItem: foundObjectMetadataItem,
      })
    : gql`
        query EmptyQuery {
          empty
        }
      `;

  const createOneMutation = foundObjectMetadataItem
    ? generateCreateOneObjectMutation({
        ObjectMetadataItem: foundObjectMetadataItem,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  const updateOneMutation = foundObjectMetadataItem
    ? generateUpdateOneObjectMutation({
        ObjectMetadataItem: foundObjectMetadataItem,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  // TODO: implement backend delete
  const deleteOneMutation = foundObjectMetadataItem
    ? generateDeleteOneObjectMutation({
        ObjectMetadataItem: foundObjectMetadataItem,
      })
    : gql`
        mutation EmptyMutation {
          empty
        }
      `;

  return {
    foundObjectMetadataItem,
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
