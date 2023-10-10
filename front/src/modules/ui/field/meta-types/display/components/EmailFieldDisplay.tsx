import { useEmailField } from '../../hooks/useEmailField';
import { EllipsisDisplay } from '../content-display/components/EllipsisDisplay';
import { EmailDisplay } from '../content-display/components/EmailDisplay';

export const EmailFieldDisplay = () => {
  const { fieldValue } = useEmailField();

  return (
    <EllipsisDisplay>
      <EmailDisplay value={fieldValue} />
    </EllipsisDisplay>
  );
};
