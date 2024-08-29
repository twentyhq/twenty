import { useEmailsField } from '@/object-record/record-field/meta-types/hooks/useEmailsField';
import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';

export const EmailsFieldDisplay = () => {
  const { fieldValue } = useEmailsField();

  return <EmailsDisplay value={fieldValue} />;
};
