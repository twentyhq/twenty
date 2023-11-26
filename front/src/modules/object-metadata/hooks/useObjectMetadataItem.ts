import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useGenerateCreateOneObjectMutation } from '@/object-record/utils/generateCreateOneObjectMutation';
import { useGenerateDeleteOneObjectMutation } from '@/object-record/utils/useGenerateDeleteOneObjectMutation';
import { useGenerateFindManyCustomObjectsQuery } from '@/object-record/utils/useGenerateFindManyCustomObjectsQuery';
import { useGenerateFindOneCustomObjectQuery } from '@/object-record/utils/useGenerateFindOneCustomObjectQuery';
import { useGenerateUpdateOneObjectMutation } from '@/object-record/utils/useGenerateUpdateOneObjectMutation';
import { useGetRecordFromCache } from '@/object-record/utils/useGetRecordFromCache';
import { useModifyRecordFromCache } from '@/object-record/utils/useModifyRecordFromCache';
import { isDefined } from '~/utils/isDefined';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

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

export const useObjectMetadataItem = (
  { objectNamePlural, objectNameSingular }: ObjectMetadataItemIdentifier,
  depth?: number,
) => {
  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectNamePlural,
      objectNameSingular,
    }),
  );

  const objectNotFoundInMetadata = !isDefined(objectMetadataItem);

  const getRecordFromCache = useGetRecordFromCache({
    objectMetadataItem,
  });

  const modifyRecordFromCache = useModifyRecordFromCache({
    objectMetadataItem,
  });

  const findManyQuery = useGenerateFindManyCustomObjectsQuery({
    objectMetadataItem,
    depth,
  });

  const findOneQuery = useGenerateFindOneCustomObjectQuery({
    objectMetadataItem,
    depth,
  });

  const createOneMutation = useGenerateCreateOneObjectMutation({
    objectMetadataItem,
  });

  const updateOneMutation = useGenerateUpdateOneObjectMutation({
    objectMetadataItem,
  });

  const deleteOneMutation = useGenerateDeleteOneObjectMutation({
    objectMetadataItem,
  });

  const labelIdentifierFieldMetadataId = objectMetadataItem?.fields.find(
    ({ name }) => name === 'name',
  )?.id;

  const basePathToShowPage = `/object/${objectMetadataItem?.nameSingular}/`;

  return {
    labelIdentifierFieldMetadataId,
    basePathToShowPage,
    objectMetadataItem,
    objectNotFoundInMetadata,
    getRecordFromCache,
    modifyRecordFromCache,
    findManyQuery,
    findOneQuery,
    createOneMutation,
    updateOneMutation,
    deleteOneMutation,
  };
};
