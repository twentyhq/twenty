import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexIdFromCurrentContextStore } from '@/object-record/record-index/hooks/useRecordIndexIdFromCurrentContextStore';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateMultipleRecordsActionsProps = {
  objectNameSingular: string;
};

export const useUpdateMultipleRecordsActions = ({
  objectNameSingular,
}: UseUpdateMultipleRecordsActionsProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { objectMetadataItem } = useRecordIndexIdFromCurrentContextStore();

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
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

  const graphqlFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const {
    incrementalUpdateManyRecords,
    isProcessing: isUpdating,
    progress,
    cancel,
  } = useIncrementalUpdateManyRecords({
    objectNameSingular,
    filter: graphqlFilter
  });

  const updateRecords = async (fieldsToUpdate: Record<string, any>) => {
    try {
      await incrementalUpdateManyRecords(fieldsToUpdate);

      const count = isDefined(progress.totalRecordCount)
        ? progress.totalRecordCount
        : progress.processedRecordCount;

      enqueueSuccessSnackBar({
        message: t`Successfully updated ${count} records`,
      });
    } catch (error) {
      if ((error as any).name === 'AbortError') {
          return;
      }

      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update records. Please try again.',
      });
    }
  };

  return {
    updateRecords,
    isUpdating,
    progress,
    cancel,
  };
};
