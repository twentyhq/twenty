import { gql } from '@apollo/client';

import { useGenerateCreateOneObjectMutation } from '@/object-record/utils/generateCreateOneObjectMutation';
import { useGenerateDeleteOneObjectMutation } from '@/object-record/utils/useGenerateDeleteOneObjectMutation';
import { useGenerateFindManyCustomObjectsQuery } from '@/object-record/utils/useGenerateFindManyCustomObjectsQuery';
import { useGenerateFindOneCustomObjectQuery } from '@/object-record/utils/useGenerateFindOneCustomObjectQuery';
import { useGenerateUpdateOneObjectMutation } from '@/object-record/utils/useGenerateUpdateOneObjectMutation';
import { useLazyLoadIcons } from '@/ui/input/hooks/useLazyLoadIcons';
import { FieldMetadata } from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';
import { formatFieldMetadataItemAsColumnDefinition } from '../utils/formatFieldMetadataItemAsColumnDefinition';
import { formatFieldMetadataItemsAsFilterDefinitions } from '../utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '../utils/formatFieldMetadataItemsAsSortDefinitions';

import { useFindManyObjectMetadataItems } from './useFindManyObjectMetadataItems';

export const EMPTY_QUERY = gql`
  query EmptyQuery {
    empty
  }
`;

export const EMPTY_MUTATION = gql`
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

  const filterDefinitions = formatFieldMetadataItemsAsFilterDefinitions({
    fields: activeFields,
    icons,
  });

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: activeFields,
    icons,
  });

  const findManyQuery = useGenerateFindManyCustomObjectsQuery({
    objectMetadataItem: foundObjectMetadataItem,
  });

  const findOneQuery = useGenerateFindOneCustomObjectQuery({
    objectMetadataItem: foundObjectMetadataItem,
  });

  const createOneMutation = useGenerateCreateOneObjectMutation({
    objectMetadataItem: foundObjectMetadataItem,
  });

  const updateOneMutation = useGenerateUpdateOneObjectMutation({
    objectMetadataItem: foundObjectMetadataItem,
  });

  const deleteOneMutation = useGenerateDeleteOneObjectMutation({
    objectMetadataItem: foundObjectMetadataItem,
  });

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
