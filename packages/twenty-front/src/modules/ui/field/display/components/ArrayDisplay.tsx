import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { OverflowingList } from 'twenty-ui/components/layout';
import { t } from '@lingui/core/macro';
import { Chip } from 'twenty-ui/primitives/data-display';

type ArrayDisplayProps = {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  return (
    <OverflowingList overflowLabel={t`Show all items`}>
      {value?.map((item, index) => (
        <Chip key={`${item}-${index}`} variant="soft">
          {getChipLabel(item).content}
        </Chip>
      ))}
    </OverflowingList>
  );
};
