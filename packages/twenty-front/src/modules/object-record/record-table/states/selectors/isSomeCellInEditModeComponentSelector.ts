import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const iSsomeCellInEditModeComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'iSsomeCellInEditModeComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const currentTableCellInEditModePosition = get(
          recordTableCellEditModePositionComponentState,
          { instanceId },
        );

        return isDefined(currentTableCellInEditModePosition);
      },
  });
