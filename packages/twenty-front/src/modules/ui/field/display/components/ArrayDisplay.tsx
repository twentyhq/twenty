import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Chip } from 'twenty-ui/primitives/data-display';
import { useLingui } from '@lingui/react/macro';

type ArrayDisplayProps = {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  const { t } = useLingui();
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
