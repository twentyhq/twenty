import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useChipFieldDisplay';
import { isDefined } from 'twenty-shared/utils';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type ChipFieldDisplayProps = FieldDisplayTooltipProps;

export const ChipFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: ChipFieldDisplayProps) => {
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
      size="sm"
      to={labelIdentifierLink}
      forceDisableClick={disableChipClick}
      triggerEvent={triggerEvent}
      onClick={onRecordChipClick}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
