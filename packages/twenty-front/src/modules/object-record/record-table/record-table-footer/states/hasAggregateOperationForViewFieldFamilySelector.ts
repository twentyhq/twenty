import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { createFamilySelector } from '@/ui/utilities/state/jotai/utils/createFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const hasAggregateOperationForViewFieldFamilySelector =
  createFamilySelector<boolean, { viewFieldId: string }>({
    key: 'hasAggregateOperationForViewField',
    get:
      ({ viewFieldId }) =>
      ({ get }) => {
        const aggregateOperation = get(viewFieldAggregateOperationState, {
          viewFieldId,
        });

        return isDefined(aggregateOperation);
      },
  });
