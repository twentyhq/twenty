import { Chip, ChipVariant } from 'twenty-ui';

import { FieldArrayValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

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
        />
      ))}
    </ExpandableList>
  );
};
