import { useAddressField } from '@/object-record/record-field/meta-types/hooks/useAddressField';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay';

export const AddressFieldDisplay = () => {
  const { fieldValue } = useAddressField();

  const content = [
    fieldValue?.addressStreet1,
    fieldValue?.addressStreet2,
    fieldValue?.addressCity,
    fieldValue?.addressCountry,
  ]
    .filter(Boolean)
    .join(', ');

  return <TextDisplay text={content} />;
};
