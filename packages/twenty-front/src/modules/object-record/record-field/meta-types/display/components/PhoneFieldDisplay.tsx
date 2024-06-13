import { usePhoneFieldDisplay } from '@/object-record/record-field/meta-types/hooks/usePhoneFieldDisplay';
import { PhoneDisplay } from '@/ui/field/display/components/PhoneDisplay';

export const PhoneFieldDisplay = () => {
  const { fieldValue } = usePhoneFieldDisplay();

  return <PhoneDisplay value={fieldValue} />;
};
