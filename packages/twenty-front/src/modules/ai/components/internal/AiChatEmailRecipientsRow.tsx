import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, type ReactNode, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { EmailRecipientChip } from '@/activities/emails/recipients/components/EmailRecipientChip';
import { useEmailRecipientsResolution } from '@/activities/emails/recipients/hooks/useEmailRecipientsResolution';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';

const RECIPIENT_INPUT_MIN_WIDTH_PX = 80;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 28px;
  min-width: 0;
`;

const StyledInputContainer = styled.div`
  flex: 1 0 ${RECIPIENT_INPUT_MIN_WIDTH_PX}px;
  min-width: 0;
`;

type AiChatEmailRecipientsRowProps = {
  label: string;
  recipients: EmailRecipient[];
  disabled: boolean;
  onChange: (recipients: EmailRecipient[]) => void;
  trailing?: ReactNode;
};

export const AiChatEmailRecipientsRow = ({
  label,
  recipients,
  disabled,
  onChange,
  trailing,
}: AiChatEmailRecipientsRowProps) => {
  const { t } = useLingui();
  const [draftRecipient, setDraftRecipient] = useState('');
  const { resolutionByRecipientKey } = useEmailRecipientsResolution({
    recipients,
  });

  const addDraftRecipients = () => {
    if (disabled) {
      return;
    }

    const addedRecipients = parseEmailRecipients(draftRecipient).filter(
      ({ address }) =>
        !recipients.some((recipient) => recipient.address === address),
    );

    setDraftRecipient('');

    if (isNonEmptyArray(addedRecipients)) {
      onChange([...recipients, ...addedRecipients]);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addDraftRecipients();

      return;
    }

    if (
      event.key === 'Backspace' &&
      !isNonEmptyString(draftRecipient) &&
      isNonEmptyArray(recipients)
    ) {
      onChange(recipients.slice(0, -1));
    }
  };

  return (
    <ComposerFieldRow label={label} trailing={trailing}>
      <StyledRow>
        {recipients.map((recipient) => (
          <EmailRecipientChip
            key={recipient.address}
            recipient={recipient}
            resolution={resolutionByRecipientKey.get(
              getEmailRecipientKey(recipient.address),
            )}
            title={formatEmailRecipient(recipient)}
            onRemove={
              disabled
                ? undefined
                : () =>
                    onChange(
                      recipients.filter(
                        ({ address }) => address !== recipient.address,
                      ),
                    )
            }
            removeAriaLabel={t`Remove ${recipient.address}`}
          />
        ))}
        {!disabled && (
          <StyledInputContainer>
            <Input
              variant="plain"
              aria-label={t`Add a recipient to ${label}`}
              placeholder={
                !isNonEmptyArray(recipients) ? t`Add recipient` : undefined
              }
              value={draftRecipient}
              onChange={(event) => setDraftRecipient(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={addDraftRecipients}
            />
          </StyledInputContainer>
        )}
      </StyledRow>
    </ComposerFieldRow>
  );
};
