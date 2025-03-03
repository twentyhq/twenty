import { RecordChip } from '@/object-record/components/RecordChip';
import { useIsChipFieldDisplayLabelHidden } from '@/object-record/record-field/meta-types/display/hooks/useIsChipFieldDisplayLabelHidden';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { isDefined } from 'twenty-shared';
import { ChipSize } from 'twenty-ui';

export const ChipFieldDisplay = () => {
  const { recordValue, objectNameSingular, labelIdentifierLink } =
    useChipFieldDisplay();

  const isChipFieldDisplayLabelHidden = useIsChipFieldDisplayLabelHidden();

  if (!isDefined(recordValue)) {
    return null;
  }

  return (
    <RecordChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={labelIdentifierLink}
      isLabelHidden={isChipFieldDisplayLabelHidden}
    />
  );
};
