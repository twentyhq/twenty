import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { type FieldArrayValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { FieldDisplayTooltipContext } from '@/ui/field/display/contexts/FieldDisplayTooltipContext';
import { OverflowingList } from 'twenty-ui/components/layout';
import { t } from '@lingui/core/macro';
import { Chip } from 'twenty-ui/primitives/data-display';
import { useContext } from 'react';

type ArrayDisplayProps = {
  value: FieldArrayValue;
};

export const ArrayDisplay = ({ value }: ArrayDisplayProps) => {
  const { withTooltip, measureOverflowOnOpen, getInitialPointerPosition } =
    useContext(FieldDisplayTooltipContext);

  return (
    <OverflowingList overflowLabel={t`Show all items`}>
      {value?.map((item, index) => (
        <Chip
          key={`${item}-${index}`}
          variant="soft"
          withTooltip={withTooltip}
          measureOverflowOnOpen={measureOverflowOnOpen}
          initialPointerPosition={
            withTooltip ? getInitialPointerPosition?.() : undefined
          }
        >
          {getChipLabel(item).content}
        </Chip>
      ))}
    </OverflowingList>
  );
};
