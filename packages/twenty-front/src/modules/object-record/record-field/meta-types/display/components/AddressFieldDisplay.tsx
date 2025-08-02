import { useAddressFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useAddressFieldDisplay';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';
import { extractSubFieldsAddressValues } from '~/utils/displaySubFieldsAddress';

export const AddressFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useAddressFieldDisplay();
  const settings = fieldDefinition.metadata.settings;

  const subFields =
    settings && 'subFields' in settings ? settings.subFields : undefined;

  const parsedFieldValue = extractSubFieldsAddressValues(fieldValue, subFields);
  return <TextDisplay text={parsedFieldValue} />;
};
