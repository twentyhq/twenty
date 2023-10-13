import { PhoneDisplay } from '@/ui/Data/Field/meta-types/display/content-display/components/PhoneDisplay';

import { usePhoneField } from '../../hooks/usePhoneField';

export const PhoneFieldDisplay = () => {
  const { fieldValue } = usePhoneField();

  return <PhoneDisplay value={fieldValue} />;
};
