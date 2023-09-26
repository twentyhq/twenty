import { useEmailField } from '../../hooks/useEmailField';
import { EmailDisplay } from '../content-display/components/EmailDisplay';

export const EmailFieldDisplay = () => {
  const { fieldValue } = useEmailField();

  return <EmailDisplay value={fieldValue} />;
};
