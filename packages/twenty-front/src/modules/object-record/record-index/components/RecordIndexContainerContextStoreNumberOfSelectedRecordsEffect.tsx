import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

export const RecordIndexContainerContextStoreNumberOfSelectedRecordsEffect =
  () => {
    const setContextStoreNumberOfSelectedRecords = useSetRecoilComponentState(
      contextStoreNumberOfSelectedRecordsComponentState,
    );

    const contextStoreTargetedRecordsRule = useRecoilComponentValue(
      contextStoreTargetedRecordsRuleComponentState,
    );

    const { objectNamePlural } = useRecordIndexContextOrThrow();

    const { objectNameSingular } = useObjectNameSingularFromPlural({
      objectNamePlural,
    });

    const { objectMetadataItem } = useObjectMetadataItem({
      objectNameSingular,
    });

    const findManyRecordsParams = useFindManyRecordIndexTableParams(
      objectMetadataItem?.nameSingular ?? '',
    );

    const contextStoreFilters = useRecoilComponentValue(
      contextStoreFiltersComponentState,
    );

    const contextStoreFilterGroups = useRecoilComponentValue(
      contextStoreFilterGroupsComponentState,
    );

    const contextStoreAnyFieldFilterValue = useRecoilComponentValue(
      contextStoreAnyFieldFilterValueComponentState,
    );

    const { filterValueDependencies } = useFilterValueDependencies();

    const computedFilter = computeContextStoreFilters({
      contextStoreTargetedRecordsRule,
      contextStoreFilters,
      contextStoreFilterGroups,
      objectMetadataItem,
      filterValueDependencies,
      contextStoreAnyFieldFilterValue,
    });

    const { totalCount } = useFindManyRecords({
      ...findManyRecordsParams,
      recordGqlFields: {
        id: true,
      },
      filter: computedFilter,
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
