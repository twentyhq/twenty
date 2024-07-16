import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordIndexRecordChip } from '@/object-record/record-index/components/RecordIndexRecordChip';

export const ChipFieldDisplay = () => {
  const { recordValue, objectNameSingular, isLabelIdentifier } =
    useChipFieldDisplay();

  if (!recordValue) {
    return null;
  }

  return isLabelIdentifier ? (
    <RecordIndexRecordChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
    />
  ) : (
    <RecordChip objectNameSingular={objectNameSingular} record={recordValue} />
  );
};
