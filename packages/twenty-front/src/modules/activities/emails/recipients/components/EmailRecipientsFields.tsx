import { EmailRecipientsFieldRows } from '@/activities/emails/recipients/components/EmailRecipientsFieldRows';
import { EmailRecipientsProvider } from '@/activities/emails/recipients/components/EmailRecipientsProvider';
import { EmailRecipientsReadonlyFields } from '@/activities/emails/recipients/components/EmailRecipientsReadonlyFields';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';
import { type EmailRecipientsByFieldIdUpdater } from '@/activities/emails/recipients/types/EmailRecipientsByFieldIdUpdater';

type EmailRecipientsFieldsProps = {
  recipientsByFieldId: EmailRecipientsByFieldId;
  onChange: (update: EmailRecipientsByFieldIdUpdater) => void;
  onSubmit?: () => void;
  contextRecord?: EmailComposerContextRecord | null;
  readonly?: boolean;
};

export const EmailRecipientsFields = ({
  recipientsByFieldId,
  onChange,
  onSubmit,
  contextRecord,
  readonly = false,
}: EmailRecipientsFieldsProps) =>
  readonly ? (
    <EmailRecipientsReadonlyFields recipientsByFieldId={recipientsByFieldId} />
  ) : (
    <EmailRecipientsProvider
      recipientsByFieldId={recipientsByFieldId}
      onChange={onChange}
    >
      <EmailRecipientsFieldRows
        onSubmit={onSubmit}
        contextRecord={contextRecord}
      />
    </EmailRecipientsProvider>
  );
