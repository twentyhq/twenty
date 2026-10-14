import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { OverflowingList } from 'twenty-ui/components/layout';
import { t } from '@lingui/core/macro';
import { Chip } from 'twenty-ui/primitives/data-display';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type ArrayDisplayProps = FieldDisplayTooltipProps & {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({
  value,
  withTooltip,
  measureOverflowOnOpen,
}: ArrayDisplayProps) => {
  return (
    <OverflowingList overflowLabel={t`Show all items`}>
      {value?.map((item, index) => (
        <Chip
          key={`${item}-${index}`}
          variant="soft"
          withTooltip={withTooltip}
          measureOverflowOnOpen={measureOverflowOnOpen}
        >
          {getChipLabel(item).content}
        </Chip>
      ))}
    </OverflowingList>
  );
};
