import { useEmailFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useEmailFieldDisplay';
import { EmailDisplay } from '@/ui/field/display/components/EmailDisplay';

export const EmailFieldDisplay = () => {
  const { fieldValue } = useEmailFieldDisplay();

  return <EmailDisplay value={fieldValue} />;
};
