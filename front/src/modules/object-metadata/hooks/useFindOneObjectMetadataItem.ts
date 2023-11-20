import { gql } from '@apollo/client';

import { useGenerateCreateOneObjectMutation } from '@/object-record/utils/generateCreateOneObjectMutation';
import { useGenerateDeleteOneObjectMutation } from '@/object-record/utils/useGenerateDeleteOneObjectMutation';
import { useGenerateFindManyCustomObjectsQuery } from '@/object-record/utils/useGenerateFindManyCustomObjectsQuery';
import { useGenerateFindOneCustomObjectQuery } from '@/object-record/utils/useGenerateFindOneCustomObjectQuery';
import { useGenerateUpdateOneObjectMutation } from '@/object-record/utils/useGenerateUpdateOneObjectMutation';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

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

  const objectNotFoundInMetadata =
    objectMetadataItems.length === 0 ||
    (objectMetadataItems.length > 0 && !foundObjectMetadataItem);

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
    findManyQuery,
    findOneQuery,
    createOneMutation,
    updateOneMutation,
    deleteOneMutation,
    loading,
  };
};
