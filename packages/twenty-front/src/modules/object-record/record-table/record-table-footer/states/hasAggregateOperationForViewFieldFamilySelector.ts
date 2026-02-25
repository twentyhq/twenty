import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const hasAggregateOperationForViewFieldFamilySelector =
  createAtomFamilySelector<boolean, { viewFieldId: string }>({
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
