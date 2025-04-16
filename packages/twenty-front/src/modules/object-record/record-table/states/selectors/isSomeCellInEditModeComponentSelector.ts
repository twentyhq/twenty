import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { currentTableCellInEditModePositionComponentState } from '@/object-record/record-table/states/currentTableCellInEditModePositionComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const isSomeCellInEditModeComponentSelector = createComponentSelectorV2({
  key: 'isSomeCellInEditModeComponentSelector',
  componentInstanceContext: RecordTableComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const currentTableCellInEditModePosition = get(
        currentTableCellInEditModePositionComponentState.atomFamily({
          instanceId,
        }),
      );

      return isDefined(currentTableCellInEditModePosition);
    },
});
