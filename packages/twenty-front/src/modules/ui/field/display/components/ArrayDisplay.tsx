import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useFieldDisplayTooltipProps } from '@/ui/field/display/hooks/useFieldDisplayTooltipProps';
import { OverflowingList } from 'twenty-ui/components/layout';
import { t } from '@lingui/core/macro';
import { Chip } from 'twenty-ui/primitives/data-display';

type ArrayDisplayProps = {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  const tooltipProps = useFieldDisplayTooltipProps();

  return (
    <OverflowingList overflowLabel={t`Show all items`}>
      {value?.map((item, index) => (
        <Chip
          key={`${item}-${index}`}
          variant="soft"
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...tooltipProps}
        >
          {getChipLabel(item).content}
        </Chip>
      ))}
    </OverflowingList>
  );
};
