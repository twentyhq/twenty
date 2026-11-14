import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { EmailRecipientsFieldRows } from '@/activities/emails/recipients/components/EmailRecipientsFieldRows';
import { EmailRecipientsProvider } from '@/activities/emails/recipients/components/EmailRecipientsProvider';
import { EmailRecipientsReadonlyFields } from '@/activities/emails/recipients/components/EmailRecipientsReadonlyFields';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';

type EmailRecipientsFieldsProps = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  onChange: (recipientsByFieldId: EmailRecipientsByFieldId) => void;
  onSubmit?: () => void;
  contextRecord?: EmailComposerContextRecord | null;
  readonly?: boolean;
};

const hasCcOrBccRecipients = ({ cc, bcc }: EmailRecipientsByFieldId) =>
  isNonEmptyArray(cc) || isNonEmptyArray(bcc);

export const EmailRecipientsFields = ({
  recipientsByFieldId,
  onChange,
  onSubmit,
  contextRecord,
  readonly = false,
}: EmailRecipientsFieldsProps) => {
  // Sticky once shown, so removing the last Cc chip doesn't unmount the field being edited.
  const [isCcBccExpanded, setIsCcBccExpanded] = useState(() =>
    hasCcOrBccRecipients(recipientsByFieldId),
  );

  const handleChange = (nextRecipientsByFieldId: EmailRecipientsByFieldId) => {
    if (hasCcOrBccRecipients(nextRecipientsByFieldId)) {
      setIsCcBccExpanded(true);
    }

    onChange(nextRecipientsByFieldId);
  };

  if (readonly) {
    return (
      <EmailRecipientsReadonlyFields
        recipientsByFieldId={recipientsByFieldId}
      />
    );
  }

  return (
    <EmailRecipientsProvider
      recipientsByFieldId={recipientsByFieldId}
      onChange={handleChange}
    >
      <EmailRecipientsFieldRows
        isCcBccExpanded={isCcBccExpanded}
        onExpandCcBcc={() => setIsCcBccExpanded(true)}
        onSubmit={onSubmit}
        contextRecord={contextRecord}
      />
    </EmailRecipientsProvider>
  );
};
