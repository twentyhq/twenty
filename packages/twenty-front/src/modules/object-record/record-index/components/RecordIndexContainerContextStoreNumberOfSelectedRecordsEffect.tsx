import { contextStoreNumberOfSelectedRecordsState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsState';
import { contextStoreTargetedRecordsRuleState } from '@/context-store/states/contextStoreTargetedRecordsRuleState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { RecordIndexRootPropsContext } from '@/object-record/record-index/contexts/RecordIndexRootPropsContext';
import { useFindManyParams } from '@/object-record/record-index/hooks/useLoadRecordIndexTable';
import { useContext, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

export const RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect =
  () => {
    const setContextStoreNumberOfSelectedRecords = useSetRecoilState(
      contextStoreNumberOfSelectedRecordsState,
    );

    const contextStoreTargetedRecordsRule = useRecoilValue(
      contextStoreTargetedRecordsRuleState,
    );

    const { objectNamePlural } = useContext(RecordIndexRootPropsContext);

    const { objectNameSingular } = useObjectNameSingularFromPlural({
      objectNamePlural,
    });

    const { objectMetadataItem } = useObjectMetadataItem({
      objectNameSingular,
    });

    const findManyRecordsParams = useFindManyParams(
      objectMetadataItem?.nameSingular ?? '',
      objectMetadataItem?.namePlural ?? '',
    );

    const { totalCount } = useFindManyRecords({
      ...findManyRecordsParams,
      recordGqlFields: {
        id: true,
      },
      filter: computeContextStoreFilters(
        contextStoreTargetedRecordsRule,
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
