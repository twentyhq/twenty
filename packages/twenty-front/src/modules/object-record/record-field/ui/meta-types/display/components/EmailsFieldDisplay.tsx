import { useEmailsFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsFieldDisplay';
import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { FieldMetadataSettingsOnClickAction } from 'twenty-shared/types';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const EmailsFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useEmailsFieldDisplay();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const onClickAction = fieldDefinition.metadata.settings?.clickAction;

  const handleEmailClick = (
    email: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (onClickAction === FieldMetadataSettingsOnClickAction.COPY) {
      event.preventDefault();
      copyToClipboard(email, t`Email copied to clipboard`);
    }
  };

  return <EmailsDisplay value={fieldValue} onEmailClick={handleEmailClick} />;
};
