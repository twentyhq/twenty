import { EmailDisplay } from '@/ui/field/display/components/EmailDisplay';

import { useEmailField } from '../../hooks/useEmailField';

export const EmailFieldDisplay = () => {
  const { fieldValue } = useEmailField();

  return <EmailDisplay value={fieldValue} />;
};
