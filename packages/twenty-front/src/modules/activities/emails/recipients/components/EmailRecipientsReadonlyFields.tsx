import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { EmailRecipientChip } from '@/activities/emails/recipients/components/EmailRecipientChip';
import { EMAIL_RECIPIENTS_FIELD_IDS } from '@/activities/emails/recipients/constants/EmailRecipientsFieldIds';
import { useEmailRecipientsResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/types/EmailRecipientsByFieldId';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';

const StyledChips = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[7]};
  min-width: 0;
`;

type EmailRecipientsReadonlyFieldsProps = {
  recipientsByFieldId: EmailRecipientsByFieldId;
};

export const EmailRecipientsReadonlyFields = ({
  recipientsByFieldId,
}: EmailRecipientsReadonlyFieldsProps) => {
  const { t } = useLingui();
  const { resolutionByRecipientKey } = useEmailRecipientsResolution({
    recipients: Object.values(recipientsByFieldId).flat(),
  });

  const labelByFieldId: Record<EmailRecipientsFieldId, string> = {
    to: t`To`,
    cc: t`Cc`,
    bcc: t`Bcc`,
  };

  return EMAIL_RECIPIENTS_FIELD_IDS.filter(
    (fieldId) =>
      fieldId === 'to' || isNonEmptyArray(recipientsByFieldId[fieldId]),
  ).map((fieldId) => (
    <ComposerFieldRow key={fieldId} label={labelByFieldId[fieldId]}>
      <StyledChips>
        {recipientsByFieldId[fieldId].map((recipient) => (
          <EmailRecipientChip
            key={recipient.address}
            recipient={recipient}
            resolution={resolutionByRecipientKey.get(
              getEmailRecipientKey(recipient.address),
            )}
            title={formatEmailRecipient(recipient)}
            removeAriaLabel={t`Remove ${recipient.address}`}
          />
        ))}
      </StyledChips>
    </ComposerFieldRow>
  ));
};
