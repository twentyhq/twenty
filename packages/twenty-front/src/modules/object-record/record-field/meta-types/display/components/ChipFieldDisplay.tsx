import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ChipSize } from 'twenty-ui/components';

export const ChipFieldDisplay = () => {
  const {
    recordValue,
    objectNameSingular,
    labelIdentifierLink,
    isLabelIdentifierCompact,
    disableChipClick,
    maxWidth,
    triggerEvent,
  } = useChipFieldDisplay();
  const { cellPosition } = useContext(RecordTableCellContext);

  const { activateRecordTableRow } = useActiveRecordTableRow();
  const onclick = () => {
    activateRecordTableRow(cellPosition.row);
  };

  if (!isDefined(recordValue)) {
    return null;
  }

  return (
    <RecordChip
      maxWidth={maxWidth}
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={labelIdentifierLink}
      isLabelHidden={isLabelIdentifierCompact}
      forceDisableClick={disableChipClick}
      triggerEvent={triggerEvent}
      onclick={onclick}
    />
  );
};
