import { useAddressFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useAddressFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';
import { formatAddressDisplay } from '@/object-record/record-field/ui/utils/formatAddressDisplay';
import { type FieldDisplayTooltipProps } from '@/ui/field/display/types/FieldDisplayTooltipProps';

type AddressFieldDisplayProps = FieldDisplayTooltipProps;

export const AddressFieldDisplay = ({
  withTooltip,
  measureOverflowOnOpen,
}: AddressFieldDisplayProps) => {
  const { fieldValue, fieldDefinition } = useAddressFieldDisplay();
  const settings = fieldDefinition.metadata.settings;

  const subFields =
    settings && 'subFields' in settings ? settings.subFields : undefined;

  const parsedFieldValue = formatAddressDisplay(fieldValue, subFields);
  return (
    <TextDisplay
      text={parsedFieldValue}
      withTooltip={withTooltip}
      measureOverflowOnOpen={measureOverflowOnOpen}
    />
  );
};
