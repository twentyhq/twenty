import { useArrayFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useArrayFieldDisplay';
import { ArrayDisplay } from '@/ui/field/display/components/ArrayDisplay';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type ArrayFieldDisplayProps = FieldDisplayTooltipProps;

export const ArrayFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: ArrayFieldDisplayProps) => {
  const { fieldValue } = useArrayFieldDisplay();

  if (!Array.isArray(fieldValue)) {
    return <></>;
  }

  return (
    <ArrayDisplay
      value={fieldValue}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
