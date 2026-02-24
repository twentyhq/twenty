import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { createFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createFamilySelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const hasAggregateOperationForViewFieldFamilySelector =
  createFamilySelectorV2<boolean, { viewFieldId: string }>({
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
