import { useUuidField } from '@/object-record/record-field/ui/meta-types/hooks/useUuidField';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type UuidFieldDisplayProps = FieldDisplayTooltipProps;

export const UuidFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: UuidFieldDisplayProps) => {
  const { fieldValue } = useUuidField();

  return (
    <TextDisplay
      text={fieldValue}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
