import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 28px;
`;

const StyledRowLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  width: 32px;
`;

const StyledInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  flex: 1 0 80px;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 80px;
  outline: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

type AiChatEmailRecipientsRowProps = {
  label: string;
  recipients: EmailRecipient[];
  disabled: boolean;
  onChange: (recipients: EmailRecipient[]) => void;
};

export const AiChatEmailRecipientsRow = ({
  label,
  recipients,
  disabled,
  onChange,
}: AiChatEmailRecipientsRowProps) => {
  const { t } = useLingui();
  const [draftRecipient, setDraftRecipient] = useState('');

  const addDraftRecipients = () => {
    const addedRecipients = parseEmailRecipients(draftRecipient).filter(
      ({ address }) =>
        !recipients.some((recipient) => recipient.address === address),
    );

    setDraftRecipient('');

    if (addedRecipients.length > 0) {
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
      draftRecipient.length === 0 &&
      recipients.length > 0
    ) {
      onChange(recipients.slice(0, -1));
    }
  };

  return (
    <StyledRow>
      <StyledRowLabel>{label}</StyledRowLabel>
      {recipients.map(({ address }) => (
        <Chip
          key={address}
          variant="soft"
          endElement={
            disabled ? undefined : (
              <LightIconButton
                size="sm"
                aria-label={t`Remove ${address}`}
                onClick={() =>
                  onChange(
                    recipients.filter(
                      (recipient) => recipient.address !== address,
                    ),
                  )
                }
              >
                <IconX />
              </LightIconButton>
            )
          }
        >
          {address}
        </Chip>
      ))}
      {!disabled && (
        <StyledInput
          aria-label={t`Add a recipient to ${label}`}
          placeholder={recipients.length === 0 ? t`Add recipient` : undefined}
          value={draftRecipient}
          onChange={(event) => setDraftRecipient(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addDraftRecipients}
        />
      )}
    </StyledRow>
  );
};
