import { getScopeViewPrefillViewFilters } from '@/object-record/record-column-scope/utils/getScopeViewPrefillViewFilters';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { type ViewFilterGroup } from '@/views/types/ViewFilterGroup';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { ViewFilterOperand } from 'twenty-shared/types';

const buildViewFilter = ({
  id,
  viewFilterGroupId,
}: {
  id: string;
  viewFilterGroupId?: string;
}): ViewFilter => ({
  id,
  fieldMetadataId: `field-${id}`,
  operand: ViewFilterOperand.IS,
  value: 'value',
  viewFilterGroupId,
});

const buildViewFilterGroup = ({
  id,
  logicalOperator,
  parentViewFilterGroupId,
}: {
  id: string;
  logicalOperator: ViewFilterGroupLogicalOperator;
  parentViewFilterGroupId?: string;
}): ViewFilterGroup => ({
  id,
  viewId: 'scope-view',
  logicalOperator,
  parentViewFilterGroupId,
});

const getPrefillViewFilterIds = ({
  viewFilters,
  viewFilterGroups,
}: {
  viewFilters: ViewFilter[];
  viewFilterGroups: ViewFilterGroup[];
}) =>
  getScopeViewPrefillViewFilters({ viewFilters, viewFilterGroups }).map(
    ({ id }) => id,
  );

describe('getScopeViewPrefillViewFilters', () => {
  it('keeps filters in AND groups nested under AND groups', () => {
    expect(
      getPrefillViewFilterIds({
        viewFilterGroups: [
          buildViewFilterGroup({
            id: 'root',
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
          }),
          buildViewFilterGroup({
            id: 'nested',
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
            parentViewFilterGroupId: 'root',
          }),
        ],
        viewFilters: [
          buildViewFilter({ id: 'ungrouped' }),
          buildViewFilter({ id: 'in-root', viewFilterGroupId: 'root' }),
          buildViewFilter({ id: 'in-nested', viewFilterGroupId: 'nested' }),
        ],
      }),
    ).toEqual(['ungrouped', 'in-root', 'in-nested']);
  });

  it('drops filters with an OR group anywhere above them', () => {
    expect(
      getPrefillViewFilterIds({
        viewFilterGroups: [
          buildViewFilterGroup({
            id: 'root',
            logicalOperator: ViewFilterGroupLogicalOperator.OR,
          }),
          buildViewFilterGroup({
            id: 'nested',
            logicalOperator: ViewFilterGroupLogicalOperator.AND,
            parentViewFilterGroupId: 'root',
          }),
        ],
        viewFilters: [
          buildViewFilter({ id: 'in-root', viewFilterGroupId: 'root' }),
          buildViewFilter({ id: 'in-nested', viewFilterGroupId: 'nested' }),
        ],
      }),
    ).toEqual([]);
  });
});
