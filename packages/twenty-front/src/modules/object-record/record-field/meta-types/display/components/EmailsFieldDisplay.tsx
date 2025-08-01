import { useEmailsFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useEmailsFieldDisplay';
import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';

export const EmailsFieldDisplay = () => {
  const { fieldValue } = useEmailsFieldDisplay();

  console.log('EmailsFieldDisplay', fieldValue);

  return <EmailsDisplay value={fieldValue} />;
};
