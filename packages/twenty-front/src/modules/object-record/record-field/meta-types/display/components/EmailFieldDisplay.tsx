import { EmailDisplay } from 'twenty-ui';

import { useEmailField } from '../../hooks/useEmailField';

export const EmailFieldDisplay = () => {
  const { fieldValue } = useEmailField();

  return <EmailDisplay value={fieldValue} />;
};
