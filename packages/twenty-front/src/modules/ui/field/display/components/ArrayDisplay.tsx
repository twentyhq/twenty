import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { t } from '@lingui/core/macro';
import { Chip, ChipVariant } from 'twenty-ui/components';

type ArrayDisplayProps = {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  return (
    <ExpandableList>
      {value?.map((item, index) => (
        <Chip
          key={`${item}-${index}`}
          variant={ChipVariant.Highlighted}
          label={item}
          emptyLabel={t`Untitled`}
        />
      ))}
    </ExpandableList>
  );
};
