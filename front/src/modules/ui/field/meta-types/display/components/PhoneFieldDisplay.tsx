import { PhoneDisplay } from '@/ui/field/meta-types/display/content-display/components/PhoneDisplay';

import { usePhoneField } from '../../hooks/usePhoneField';
import { EllipsisDisplay } from '../content-display/components/EllipsisDisplay';

export const PhoneFieldDisplay = () => {
  const { fieldValue } = usePhoneField();

  return (
    <EllipsisDisplay>
      <PhoneDisplay value={fieldValue} />
    </EllipsisDisplay>
  );
};
