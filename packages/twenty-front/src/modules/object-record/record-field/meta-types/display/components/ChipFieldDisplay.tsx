import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { isDefined } from 'twenty-shared';
import { ChipSize } from 'twenty-ui';

export const ChipFieldDisplay = () => {
  const { recordValue, objectNameSingular, labelIdentifierLink } =
    useChipFieldDisplay();

  if (!isDefined(recordValue)) {
    return null;
  }

  return (
    <RecordChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={labelIdentifierLink}
    />
  );
};
