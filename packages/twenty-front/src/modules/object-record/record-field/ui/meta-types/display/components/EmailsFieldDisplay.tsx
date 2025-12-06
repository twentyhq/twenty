import { useEmailsFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useEmailsFieldDisplay';
import { EmailsDisplay } from '@/ui/field/display/components/EmailsDisplay';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import {
  FieldClickAction,
  type FieldMetadataMultiItemSettings,
} from 'twenty-shared/types';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const EmailsFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useEmailsFieldDisplay();
  const { copyToClipboard } = useCopyToClipboard();
  const { t } = useLingui();

  const settings = fieldDefinition.metadata
    .settings as FieldMetadataMultiItemSettings | null;
  const clickAction = settings?.clickAction ?? FieldClickAction.OPEN_LINK;

  const handleEmailClick = (
    email: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    event.preventDefault();
    copyToClipboard(email, t`Email copied to clipboard`);
  };

  return (
    <EmailsDisplay
      value={fieldValue}
      onEmailClick={
        clickAction === FieldClickAction.COPY ? handleEmailClick : undefined
      }
      clickAction={clickAction}
    />
  );
};
