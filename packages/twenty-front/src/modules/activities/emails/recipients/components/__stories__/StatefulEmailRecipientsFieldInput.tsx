import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { EmailRecipientsProvider } from '@/activities/emails/recipients/components/EmailRecipientsProvider';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';

type StatefulEmailRecipientsFieldInputProps = {
  initialRecipients?: EmailRecipient[];
  onSubmit: () => void;
};

export const StatefulEmailRecipientsFieldInput = ({
  initialRecipients = [],
  onSubmit,
}: StatefulEmailRecipientsFieldInputProps) => {
  const [recipientsByFieldId, setRecipientsByFieldId] =
    useState<EmailRecipientsByFieldId>({
      to: initialRecipients,
      cc: [],
      bcc: [],
    });

  return (
    <EmailRecipientsProvider
      recipientsByFieldId={recipientsByFieldId}
      onChange={setRecipientsByFieldId}
    >
      {(['to', 'cc'] as const).map((fieldId) => (
        <div key={fieldId} role="group" aria-label={`${fieldId} recipients`}>
          <ComposerFieldRow
            label={fieldId === 'to' ? 'To' : 'Cc'}
            hasDivider={false}
          >
            <EmailRecipientsFieldInput
              fieldId={fieldId}
              label={fieldId === 'to' ? 'To' : 'Cc'}
              onSubmit={onSubmit}
            />
          </ComposerFieldRow>
        </div>
      ))}
      <Button onClick={onSubmit}>Send</Button>
    </EmailRecipientsProvider>
  );
};
