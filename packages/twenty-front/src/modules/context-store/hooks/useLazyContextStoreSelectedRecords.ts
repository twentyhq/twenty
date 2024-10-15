import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordsFiltersState } from '@/context-store/states/contextStoreTargetedRecordsFilters';
import { contextStoreTargetedRecordsState } from '@/context-store/states/contextStoreTargetedRecordsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { turnFiltersIntoQueryFilter } from '@/object-record/record-filter/utils/turnFiltersIntoQueryFilter';
import { makeAndFilterVariables } from '@/object-record/utils/makeAndFilterVariables';
import { useRecoilValue } from 'recoil';

export const useLazyContextStoreSelectedRecords = ({
  limit = undefined,
  recordGqlFields,
}: {
  limit?: number;
  recordGqlFields?: RecordGqlFields;
}) => {
  const contextStoreTargetedRecords = useRecoilValue(
    contextStoreTargetedRecordsState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const contextStoreTargetedRecordsFilters = useRecoilValue(
    contextStoreTargetedRecordsFiltersState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });
  const queryFilter = turnFiltersIntoQueryFilter(
    contextStoreTargetedRecordsFilters,
    objectMetadataItem?.fields ?? [],
  );

  const selectedRecordIds = contextStoreTargetedRecords.selectedRecordIds;
  const excludedRecordIds = contextStoreTargetedRecords.excludedRecordIds;

  return useLazyFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    recordGqlFields:
      recordGqlFields ??
      (objectMetadataItem
        ? generateDepthOneRecordGqlFields({ objectMetadataItem })
        : undefined),
    filter: makeAndFilterVariables([
      queryFilter,
      selectedRecordIds !== 'all'
        ? {
            id: {
              in: selectedRecordIds,
            },
          }
        : excludedRecordIds.length > 0
          ? {
              not: {
                id: {
                  in: excludedRecordIds,
                },
              },
            }
          : undefined,
    ]),
    limit,
  });
};
