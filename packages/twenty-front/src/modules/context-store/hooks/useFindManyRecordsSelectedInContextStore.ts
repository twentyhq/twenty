import { useContextStoreCurrentObjectMetadataIdOrThrow } from '@/context-store/hooks/useContextStoreCurrentObjectMetadataIdOrThrow';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const useFindManyRecordsSelectedInContextStore = ({
  instanceId,
  limit = 3,
}: {
  instanceId?: string;
  limit?: number;
}) => {
  const objectMetadataId =
    useContextStoreCurrentObjectMetadataIdOrThrow(instanceId);

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    instanceId,
  );

  const contextStoreFilters = useRecoilComponentValueV2(
    contextStoreFiltersComponentState,
    instanceId,
  );

  const queryFilter = computeContextStoreFilters(
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    objectMetadataItem,
  );

  const { records, loading, totalCount } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    filter: queryFilter,
    orderBy: [
      {
        position: 'AscNullsFirst',
      },
    ],
    skip:
      contextStoreTargetedRecordsRule.mode === 'selection' &&
      contextStoreTargetedRecordsRule.selectedRecordIds.length === 0,
    limit,
  });

  return {
    records,
    totalCount,
    loading,
  };
};
