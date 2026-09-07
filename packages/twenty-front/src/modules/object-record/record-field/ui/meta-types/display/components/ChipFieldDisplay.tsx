import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useChipFieldDisplay';
import { isDefined } from 'twenty-shared/utils';
import { ChipSize } from 'twenty-ui/data-display';

export const ChipFieldDisplay = () => {
  const {
    recordStore: recordValue,
    objectNameSingular,
    labelIdentifierLink,
    disableChipClick,
    maxWidth,
    triggerEvent,
    onRecordChipClick,
  } = useChipFieldDisplay();

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
      forceDisableClick={disableChipClick}
      triggerEvent={triggerEvent}
      onClick={onRecordChipClick}
    />
  );
};
