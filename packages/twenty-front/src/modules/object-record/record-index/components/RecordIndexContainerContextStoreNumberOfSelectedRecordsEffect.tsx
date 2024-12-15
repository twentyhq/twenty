import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useContext, useEffect } from 'react';

export const RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect =
  () => {
    const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentStateV2(
      contextStoreNumberOfSelectedRecordsComponentState,
    );

    const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
      contextStoreTargetedRecordsRuleComponentState,
    );

    const { objectNamePlural } = useContext(RecordIndexRootPropsContext);

    const { objectNameSingular } = useObjectNameSingularFromPlural({
      objectNamePlural,
    });

    const { objectMetadataItem } = useObjectMetadataItem({
      objectNameSingular,
    });

    const findManyRecordsParams = useFindManyRecordIndexTableParams(
      objectMetadataItem?.nameSingular ?? '',
      objectMetadataItem?.namePlural ?? '',
    );

    const contextStoreFilters = useRecoilComponentValueV2(
      contextStoreFiltersComponentState,
    );

    const { totalCount } = useFindManyRecords({
      ...findManyRecordsParams,
      recordGqlFields: {
        id: true,
      },
      filter: computeContextStoreFilters(
        contextStoreTargetedRecordsRule,
        contextStoreFilters,
        objectMetadataItem,
      ),
      limit: 1,
      skip: contextStoreTargetedRecordsRule.mode === 'selection',
    });

    useEffect(() => {
      if (contextStoreTargetedRecordsRule.mode === 'selection') {
        setContextStoreNumberOfSelectedRecords(
          contextStoreTargetedRecordsRule.selectedRecordIds.length,
        );
      }
      if (contextStoreTargetedRecordsRule.mode === 'exclusion') {
        setContextStoreNumberOfSelectedRecords(totalCount ?? 0);
      }
    }, [
      contextStoreTargetedRecordsRule,
      setContextStoreNumberOfSelectedRecords,
      totalCount,
    ]);

    return null;
  };
