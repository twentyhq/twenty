import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useIncrementalUpdateManyRecords } from '@/object-record/hooks/useIncrementalUpdateManyRecords';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';

type UseUpdateMultipleRecordsActionsProps = {
  objectNameSingular: string;
  contextStoreInstanceId: string;
};

export const useUpdateMultipleRecordsActions = ({
  objectNameSingular,
  contextStoreInstanceId,
}: UseUpdateMultipleRecordsActionsProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilters = useRecoilComponentValue(
    contextStoreFiltersComponentState,
    contextStoreInstanceId,
  );

  const contextStoreFilterGroups = useRecoilComponentValue(
    contextStoreFilterGroupsComponentState,
    contextStoreInstanceId,
  );

  const contextStoreAnyFieldFilterValue = useRecoilComponentValue(
    contextStoreAnyFieldFilterValueComponentState,
    contextStoreInstanceId,
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
    filter: graphqlFilter,
  });

  const updateRecords = async (fieldsToUpdate: Record<string, any>) => {
    try {
      const count = await incrementalUpdateManyRecords(fieldsToUpdate);

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
