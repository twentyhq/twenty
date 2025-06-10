import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const isSomeCellInEditModeComponentSelector = createComponentSelectorV2({
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
