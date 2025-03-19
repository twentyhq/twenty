import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const hasAggregateOperationForViewFieldFamilySelector = selectorFamily<
  boolean,
  { viewFieldId: string }
>({
  key: 'hasAggregateOperationForViewField',
  get:
    ({ viewFieldId }) =>
    ({ get }) => {
      const aggregateOperation = get(
        viewFieldAggregateOperationState({
          viewFieldId,
        }),
      );

      return isDefined(aggregateOperation);
    },
});
