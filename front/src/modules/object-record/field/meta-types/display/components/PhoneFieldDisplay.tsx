import { PhoneDisplay } from '@/ui/field/components/PhoneDisplay';

import { usePhoneField } from '../../hooks/usePhoneField';

export const PhoneFieldDisplay = () => {
  const { fieldValue } = usePhoneField();

  return <PhoneDisplay value={fieldValue} />;
};
