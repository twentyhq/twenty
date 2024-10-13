import { useUpsertCombinedViewFilterGroup } from '@/object-record/advanced-filter/hooks/useUpsertCombinedViewFilterGroup';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useUpsertCombinedViewFilters } from '@/views/hooks/useUpsertCombinedViewFilters';
import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { IconPlus } from 'twenty-ui';
import { v4 } from 'uuid';

interface AdvancedFilterAddFilterRuleSelectProps {
  viewId?: string;
  currentViewFilterGroup: ViewFilterGroup;
  childViewFiltersAndViewFilterGroups: (ViewFilterGroup | ViewFilter)[];
  isFilterRuleGroupOptionVisible?: boolean;
}

export const AdvancedFilterAddFilterRuleSelect = (
  props: AdvancedFilterAddFilterRuleSelectProps,
) => {
  const { upsertCombinedViewFilterGroup } = useUpsertCombinedViewFilterGroup();
  const { upsertCombinedViewFilter } = useUpsertCombinedViewFilters();

  const newPositionInViewFilterGroup =
    (props.childViewFiltersAndViewFilterGroups[
      props.childViewFiltersAndViewFilterGroups.length - 1
    ]?.positionInViewFilterGroup ?? 0) + 1;

  const handleAddFilter = () => {
    upsertCombinedViewFilter({
      id: v4(),
      variant: 'default',
      fieldMetadataId: undefined as any,
      operand: ViewFilterOperand.Is,
      value: '',
      displayValue: '',
      definition: {} as any,
      viewFilterGroupId: props.currentViewFilterGroup.id,
      positionInViewFilterGroup: newPositionInViewFilterGroup,
    });
  };

  return (
    <>
      <LightButton
        Icon={IconPlus}
        title="Add filter rule"
        onClick={handleAddFilter}
      />
      {props.isFilterRuleGroupOptionVisible && (
        <LightButton
          Icon={IconPlus}
          title="Add filter rule group"
          onClick={() => {
            if (!props.viewId) {
              throw new Error('Missing view id');
            }

            upsertCombinedViewFilterGroup({
              id: v4(),
              viewId: props.viewId,
              logicalOperator: ViewFilterGroupLogicalOperator.AND,
              parentViewFilterGroupId: props.currentViewFilterGroup.id,
              positionInViewFilterGroup: newPositionInViewFilterGroup,
            });
          }}
        />
      )}
    </>
  );
};
