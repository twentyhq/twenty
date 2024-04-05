import { gql } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState.ts';
import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { useGetObjectOrderByField } from '@/object-metadata/hooks/useGetObjectOrderByField';
import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useGenerateCreateManyRecordMutation } from '@/object-record/hooks/useGenerateCreateManyRecordMutation';
import { useGenerateDeleteManyRecordMutation } from '@/object-record/hooks/useGenerateDeleteManyRecordMutation';
import { useGenerateExecuteQuickActionOnOneRecordMutation } from '@/object-record/hooks/useGenerateExecuteQuickActionOnOneRecordMutation';
import { useGenerateFindDuplicateRecordsQuery } from '@/object-record/hooks/useGenerateFindDuplicateRecordsQuery';
import { useGenerateFindOneRecordQuery } from '@/object-record/hooks/useGenerateFindOneRecordQuery';
import { generateDeleteOneRecordMutation } from '@/object-record/utils/generateDeleteOneRecordMutation';
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
  { objectNameSingular }: ObjectMetadataItemIdentifier,
  depth?: number,
) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const mockObjectMetadataItems = getObjectMetadataItemsMock();

  let objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  let objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (currentWorkspace?.activationStatus !== 'active') {
    objectMetadataItem =
      mockObjectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === objectNameSingular,
      ) ?? null;
    objectMetadataItems = mockObjectMetadataItems;
  }

  if (!isDefined(objectMetadataItem)) {
    throw new ObjectMetadataItemNotFoundError(
      objectNameSingular,
      objectMetadataItems,
    );
  }

  const mapToObjectRecordIdentifier = useMapToObjectRecordIdentifier({
    objectMetadataItem,
  });

  const getObjectOrderByField = useGetObjectOrderByField({
    objectMetadataItem,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectMetadataItem,
  });

  const generateFindDuplicateRecordsQuery =
    useGenerateFindDuplicateRecordsQuery();
  const findDuplicateRecordsQuery = generateFindDuplicateRecordsQuery({
    objectMetadataItem,
    depth,
  });

  const generateFindOneRecordQuery = useGenerateFindOneRecordQuery();
  const findOneRecordQuery = generateFindOneRecordQuery({
    objectMetadataItem,
    depth,
  });

  const createManyRecordsMutation = useGenerateCreateManyRecordMutation({
    objectMetadataItem,
    depth,
  });

  const deleteOneRecordMutation = generateDeleteOneRecordMutation({
    objectMetadataItem,
  });

  const deleteManyRecordsMutation = useGenerateDeleteManyRecordMutation({
    objectMetadataItem,
  });

  const executeQuickActionOnOneRecordMutation =
    useGenerateExecuteQuickActionOnOneRecordMutation({
      objectMetadataItem,
    });

  const labelIdentifierFieldMetadata =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const basePathToShowPage = getBasePathToShowPage({
    objectMetadataItem,
  });

  return {
    labelIdentifierFieldMetadata,
    basePathToShowPage,
    objectMetadataItem,
    getRecordFromCache,
    findDuplicateRecordsQuery,
    findOneRecordQuery,
    deleteOneRecordMutation,
    executeQuickActionOnOneRecordMutation,
    createManyRecordsMutation,
    deleteManyRecordsMutation,
    mapToObjectRecordIdentifier,
    getObjectOrderByField,
  };
};
