import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type KeyboardEvent, type ReactNode, useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { LightIconButton } from 'twenty-ui/components/input';
import { IconX } from 'twenty-ui/icon';
import { Chip } from 'twenty-ui/primitives/data-display';
import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';
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
  isLabelVisible?: boolean;
};

export const AiChatEmailRecipientsRow = ({
  label,
  recipients,
  disabled,
  onChange,
  trailing,
  isLabelVisible = true,
}: AiChatEmailRecipientsRowProps) => {
  const { t } = useLingui();
  const [draftRecipient, setDraftRecipient] = useState('');

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
    <ComposerFieldRow
      label={label}
      isLabelVisible={isLabelVisible}
      trailing={trailing}
    >
      <StyledRow>
        {recipients.map(({ address, displayName }) => (
          <Chip
            key={address}
            variant="soft"
            endElement={
              disabled ? undefined : (
                <LightIconButton
                  size="xs"
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
            title={address}
          >
            {isNonEmptyString(displayName) ? displayName : address}
          </Chip>
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
