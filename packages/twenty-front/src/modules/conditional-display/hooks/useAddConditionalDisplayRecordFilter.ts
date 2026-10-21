import { buildConditionalDisplayContextRecordFilter } from '@/conditional-display/utils/buildConditionalDisplayContextRecordFilter';
import { useChildRecordFiltersAndRecordFilterGroups } from '@/object-record/advanced-filter/hooks/useChildRecordFiltersAndRecordFilterGroups';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useUpsertRecordFilterGroup } from '@/object-record/record-filter-group/hooks/useUpsertRecordFilterGroup';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import {
  type ConditionalDisplayContextKey,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useAddConditionalDisplayRecordFilter = () => {
  const rootRecordFilterGroup = useAtomComponentSelectorValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { lastChildPosition } = useChildRecordFiltersAndRecordFilterGroups({
    recordFilterGroupId: rootRecordFilterGroup?.id,
  });

  const { upsertRecordFilterGroup } = useUpsertRecordFilterGroup();
  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();

  const addConditionalDisplayRecordFilter = (
    contextKey: ConditionalDisplayContextKey,
  ) => {
    if (isDefined(rootRecordFilterGroup)) {
      const newRecordFilter = buildConditionalDisplayContextRecordFilter({
        id: v4(),
        contextKey,
        recordFilterGroupId: rootRecordFilterGroup.id,
        positionInRecordFilterGroup: lastChildPosition + 1,
      });

      upsertRecordFilter(newRecordFilter);
      setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
      return;
    }

    const newRecordFilterGroup: RecordFilterGroup = {
      id: v4(),
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    };

    upsertRecordFilterGroup(newRecordFilterGroup);

    const newRecordFilter = buildConditionalDisplayContextRecordFilter({
      id: v4(),
      contextKey,
      recordFilterGroupId: newRecordFilterGroup.id,
      positionInRecordFilterGroup: 0,
    });

    upsertRecordFilter(newRecordFilter);
    setRecordFilterUsedInAdvancedFilterDropdownRow(newRecordFilter);
  };

  return {
    addConditionalDisplayRecordFilter,
  };
};
