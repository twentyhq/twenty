import { buildConditionalDisplayContextRecordFilter } from '@/conditional-display/utils/buildConditionalDisplayContextRecordFilter';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type ConditionalDisplayContextKey } from 'twenty-shared/types';

type ApplyConditionalDisplayContextKeyParams = {
  contextKey: ConditionalDisplayContextKey;
  recordFilterId: string;
};

export const useApplyConditionalDisplayContextKey = () => {
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const applyConditionalDisplayContextKey = ({
    contextKey,
    recordFilterId,
  }: ApplyConditionalDisplayContextKeyParams) => {
    const existingRecordFilter = currentRecordFilters.find(
      (recordFilter) => recordFilter.id === recordFilterId,
    );

    const newRecordFilter = buildConditionalDisplayContextRecordFilter({
      id: recordFilterId,
      contextKey,
      recordFilterGroupId: existingRecordFilter?.recordFilterGroupId,
      positionInRecordFilterGroup:
        existingRecordFilter?.positionInRecordFilterGroup,
    });

    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
    upsertRecordFilter(newRecordFilter);
  };

  return {
    applyConditionalDisplayContextKey,
  };
};
