import { useEmailsFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsFieldDisplay';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldEmails } from '@/object-record/record-field/ui/types/guards/isFieldEmails';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';
import { useLingui } from '@lingui/react/macro';
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react';
import { FieldMetadataType } from 'twenty-shared/types';

export const EmailsFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useEmailsFieldDisplay();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  assertFieldMetadata(FieldMetadataType.EMAILS, isFieldEmails, fieldDefinition);

  const actionMode =
    (fieldDefinition.metadata.settings?.actionMode as 'copy' | 'navigate') ??
    'copy';

  const handleClick = async (
    email: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();

    if (actionMode === 'copy') {
      try {
        await navigator.clipboard.writeText(email);
        enqueueSuccessSnackBar({
          message: t`Email address copied to clipboard`,
          options: {
            icon: <IconCircleCheck size={16} color="green" />,
            duration: 2000,
          },
        });
      } catch {
        enqueueErrorSnackBar({
          message: t`Error copying to clipboard`,
          options: {
            icon: <IconExclamationCircle size={16} color="red" />,
            duration: 2000,
          },
        });
      }
    } else if (actionMode === 'navigate') {
      window.open(`mailto:${email}`, '_blank');
    }
  };

  return <EmailsDisplay value={fieldValue} onClick={handleClick} />;
};
