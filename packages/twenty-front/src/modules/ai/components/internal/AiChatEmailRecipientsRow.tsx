import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type KeyboardEvent, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { splitEmailRecipients } from '@/ai/utils/splitEmailRecipients';

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
  recipients: string[];
  disabled: boolean;
  onChange: (recipients: string[]) => void;
  onFocus: () => void;
  onBlur: () => void;
};

export const AiChatEmailRecipientsRow = ({
  label,
  recipients,
  disabled,
  onChange,
  onFocus,
  onBlur,
}: AiChatEmailRecipientsRowProps) => {
  const { t } = useLingui();
  const [draftRecipient, setDraftRecipient] = useState('');

  const addDraftRecipients = () => {
    const addedRecipients = splitEmailRecipients(draftRecipient).filter(
      (recipient) => !recipients.includes(recipient),
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

  const handleBlur = () => {
    addDraftRecipients();
    onBlur();
  };

  return (
    <StyledRow>
      <StyledRowLabel>{label}</StyledRowLabel>
      {recipients.map((recipient) => (
        <Chip
          key={recipient}
          variant="soft"
          endElement={
            disabled ? undefined : (
              <LightIconButton
                size="sm"
                aria-label={t`Remove ${recipient}`}
                onClick={() =>
                  onChange(
                    recipients.filter((candidate) => candidate !== recipient),
                  )
                }
              >
                <IconX />
              </LightIconButton>
            )
          }
        >
          {recipient}
        </Chip>
      ))}
      {!disabled && (
        <StyledInput
          aria-label={t`Add a recipient to ${label}`}
          placeholder={recipients.length === 0 ? t`Add recipient` : undefined}
          value={draftRecipient}
          onChange={(event) => setDraftRecipient(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={handleBlur}
        />
      )}
    </StyledRow>
  );
};
