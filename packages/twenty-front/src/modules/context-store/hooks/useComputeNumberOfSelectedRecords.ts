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

  const shouldSkip = selectedRecordIds !== 'all';

  const { totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
    filter:
      excludedRecordIds.length > 0
        ? {
            not: {
              id: {
                in: excludedRecordIds,
              },
            },
          }
        : undefined,
    limit: 1,
    skip: shouldSkip,
  });

  return shouldSkip ? selectedRecordIds.length : totalCount;
};
