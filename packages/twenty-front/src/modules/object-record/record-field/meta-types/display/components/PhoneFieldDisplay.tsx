import { PhoneDisplay } from 'twenty-ui';

import { usePhoneField } from '../../hooks/usePhoneField';

export const PhoneFieldDisplay = () => {
  const { fieldValue } = usePhoneField();

  return <PhoneDisplay value={fieldValue} />;
};
