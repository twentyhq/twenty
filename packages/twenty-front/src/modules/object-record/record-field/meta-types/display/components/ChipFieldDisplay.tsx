import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { ChipSize } from 'twenty-ui';

export const ChipFieldDisplay = () => {
  const {
    recordValue,
    objectNameSingular,
    isLabelIdentifier,
    labelIdentifierLink,
  } = useChipFieldDisplay();

  if (!recordValue) {
    return null;
  }

  return isLabelIdentifier ? (
    <RecordIdentifierChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={labelIdentifierLink}
    />
  ) : (
    <RecordChip objectNameSingular={objectNameSingular} record={recordValue} />
  );
};
