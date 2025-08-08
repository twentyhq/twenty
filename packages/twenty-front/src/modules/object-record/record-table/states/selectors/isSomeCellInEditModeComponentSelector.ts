import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const isSomeCellInEditModeComponentSelector = createComponentSelector({
  key: 'isSomeCellInEditModeComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const currentTableCellInEditModePosition = get(
        recordTableCellEditModePositionComponentState.atomFamily({
          instanceId,
        }),
      );

      return isDefined(currentTableCellInEditModePosition);
    },
});
