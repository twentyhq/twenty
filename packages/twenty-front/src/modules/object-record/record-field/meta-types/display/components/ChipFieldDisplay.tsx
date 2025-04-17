import { RecordChip } from '@/object-record/components/RecordChip';
import { useChipFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useChipFieldDisplay';
import { isDefined } from 'twenty-shared/utils';
import { ChipSize } from 'twenty-ui/components';

export const ChipFieldDisplay = () => {
  const {
    recordValue,
    objectNameSingular,
    labelIdentifierLink,
    isLabelIdentifierCompact,
    fieldDefinition,
  } = useChipFieldDisplay();

  if (!isDefined(recordValue)) {
    return null;
  }

  return (
    <RecordChip
      objectNameSingular={objectNameSingular}
      record={recordValue}
      size={ChipSize.Small}
      to={labelIdentifierLink}
      isLabelHidden={isLabelIdentifierCompact}
      field={{
        type: fieldDefinition.type,
        name: fieldDefinition.metadata.fieldName,
      }}
    />
  );
};
