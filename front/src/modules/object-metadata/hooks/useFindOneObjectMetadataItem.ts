import { gql } from '@apollo/client';

import { generateCreateOneObjectMutation } from '@/object-record/utils/generateCreateOneObjectMutation';
import { generateDeleteOneObjectMutation } from '@/object-record/utils/generateDeleteOneObjectMutation';
import { generateFindManyCustomObjectsQuery } from '@/object-record/utils/generateFindManyCustomObjectsQuery';
import { generateFindOneCustomObjectQuery } from '@/object-record/utils/generateFindOneCustomObjectQuery';
import { generateUpdateOneObjectMutation } from '@/object-record/utils/generateUpdateOneObjectMutation';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';
import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemAsFilterDefinition } from '../utils/formatFieldMetadataItemAsFilterDefinition';
import { formatFieldMetadataItemAsSortDefinition } from '../utils/formatFieldMetadataItemAsSortDefinition';

import { useFindManyObjectMetadataItems } from './useFindManyObjectMetadataItems';

const EMPTY_QUERY = gql`
  query EmptyQuery {
    empty
  }
`;

const EMPTY_MUTATION = gql`
  mutation EmptyMutation {
    empty
  }
`;

export const useFindOneObjectMetadataItem = ({
  objectNamePlural,
  objectNameSingular,
  skip,
}: ObjectMetadataItemIdentifier & { skip?: boolean }) => {
  const { objectMetadataItems, loading } = useFindManyObjectMetadataItems({
    skip,
  });

  const foundObjectMetadataItem = objectMetadataItems.find(
    (object) =>
      object.namePlural === objectNamePlural ||
      object.nameSingular === objectNameSingular,
  );

  const { icons } = useLazyLoadIcons();

  const objectNotFoundInMetadata =
    objectMetadataItems.length === 0 ||
    (objectMetadataItems.length > 0 && !foundObjectMetadataItem);

  const activeFields =
    foundObjectMetadataItem?.fields.filter(({ isActive }) => isActive) ?? [];

  const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
    foundObjectMetadataItem
      ? activeFields.map((field, index) =>
          formatFieldMetadataItemAsColumnDefinition({
            position: index,
            field,
            objectMetadataItem: foundObjectMetadataItem,
            icons,
          }),
        )
      : [];

  const filterDefinitions: FilterDefinition[] = activeFields.map((field) =>
    formatFieldMetadataItemAsFilterDefinition({
      field,
      icons,
    }),
  );

  const sortDefinitions: SortDefinition[] = activeFields.map((field) =>
    formatFieldMetadataItemAsSortDefinition({
      field,
      icons,
    }),
  );

  const findManyQuery = foundObjectMetadataItem
    ? generateFindManyCustomObjectsQuery({
        objectMetadataItem: foundObjectMetadataItem,
      })
    : EMPTY_QUERY;

  const findOneQuery = foundObjectMetadataItem
    ? generateFindOneCustomObjectQuery({
        objectMetadataItem: foundObjectMetadataItem,
      })
    : EMPTY_QUERY;

  const createOneMutation = foundObjectMetadataItem
    ? generateCreateOneObjectMutation({
        objectMetadataItem: foundObjectMetadataItem,
      })
    : EMPTY_MUTATION;

  const updateOneMutation = foundObjectMetadataItem
    ? generateUpdateOneObjectMutation({
        objectMetadataItem: foundObjectMetadataItem,
      })
    : EMPTY_MUTATION;

  const deleteOneMutation = foundObjectMetadataItem
    ? generateDeleteOneObjectMutation({
        objectMetadataItem: foundObjectMetadataItem,
      })
    : EMPTY_MUTATION;

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
