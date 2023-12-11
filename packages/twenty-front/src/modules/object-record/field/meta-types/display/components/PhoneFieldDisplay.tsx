import { PhoneDisplay } from '@/ui/field/display/components/PhoneDisplay';

import { usePhoneField } from '../../hooks/usePhoneField';

export const PhoneFieldDisplay = () => {
  const { fieldValue } = usePhoneField();

  return <PhoneDisplay value={fieldValue} />;
};
