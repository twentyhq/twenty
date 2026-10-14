import { isNonEmptyString } from '@sniptt/guards';

import { useFullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type FullNameFieldDisplayProps = FieldDisplayTooltipProps;

export const FullNameFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: FullNameFieldDisplayProps) => {
  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

  return (
    <TextDisplay
      text={content}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
