import { useAddressFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useAddressFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import { formatAddressDisplay } from '~/utils/formatAddressDisplay';

export const AddressFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useAddressFieldDisplay();
  const settings = fieldDefinition.metadata.settings;

  const subFields =
    settings && 'subFields' in settings ? settings.subFields : undefined;

  const parsedFieldValue = formatAddressDisplay(fieldValue, subFields);
  return <TextDisplay text={parsedFieldValue} />;
};
