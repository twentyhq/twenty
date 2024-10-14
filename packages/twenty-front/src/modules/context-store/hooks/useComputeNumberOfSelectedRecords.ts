import { contextStoreCurrentObjectMetadataIdState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdState';
import { contextStoreTargetedRecordIdsState } from '@/context-store/states/contextStoreTargetedRecordIdsState';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecoilValue } from 'recoil';

export const useComputeNumberOfSelectedRecords = () => {
  const contextStoreTargetedRecordIds = useRecoilValue(
    contextStoreTargetedRecordIdsState,
  );

  const contextStoreCurrentObjectMetadataId = useRecoilValue(
    contextStoreCurrentObjectMetadataIdState,
  );

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: contextStoreCurrentObjectMetadataId,
  });

  const selectedRecordIds = contextStoreTargetedRecordIds.selectedRecordIds;
  const excludedRecordIds = contextStoreTargetedRecordIds.excludedRecordIds;

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    filter:
      selectedRecordIds === 'all'
        ? {
            not: {
              id: {
                in: excludedRecordIds,
              },
            },
          }
        : { id: { in: selectedRecordIds } },
    limit: 1,
  });

  return totalCount;
};
