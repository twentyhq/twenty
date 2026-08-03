import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { type MassEmailComposerState } from '@/activities/emails/mass-email/hooks/useMassEmailComposerState';
import { EMAIL_PLACEHOLDER_KEYS } from '@/activities/emails/mass-email/utils/emailPlaceholders';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Avatar } from 'twenty-ui/data-display';
import { IconRestore, IconSend, IconUsers } from 'twenty-ui/icon';
import { Button, LightIconButton, type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledMain = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[8]};
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-width: 720px;
  width: 100%;
`;

const StyledFieldRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 40px;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledFieldLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  width: 40px;
`;

const StyledFieldValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSecondaryText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledSubjectInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  outline: none;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

const StyledBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
`;

const StyledTokensRow = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
`;

const StyledPlaceholderToken = styled.code`
  background-color: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xs};
  margin-right: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const StyledMissingWarning = styled.div`
  color: ${themeCssVariables.color.yellow};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
`;

const StyledCustomizedRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

type MassEmailComposeCardProps = {
  composerState: MassEmailComposerState;
  selectedPersonId: string | null;
};

export const MassEmailComposeCard = ({
  composerState,
  selectedPersonId,
}: MassEmailComposeCardProps) => {
  const [resetNonce, setResetNonce] = useState(0);

  const { data: accountsData } = useQuery<{
    myConnectedAccounts: { id: string; handle: string }[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const accountOptions: SelectOption<string>[] =
    accountsData?.myConnectedAccounts?.map((account) => ({
      label: account.handle,
      value: account.id,
    })) ?? [];

  const currentAccountHandle = accountOptions.find(
    (option) => option.value === composerState.connectedAccountId,
  )?.label;

  const selectedRecipient = isDefined(selectedPersonId)
    ? composerState.includedRecipients.find(
        (recipient) => recipient.personId === selectedPersonId,
      )
    : undefined;

  const resolved = isDefined(selectedRecipient)
    ? composerState.resolveForRecipient(selectedRecipient)
    : null;

  const recipientCount = composerState.includedRecipients.length;

  const editorKey = `${selectedPersonId ?? 'template'}:${resetNonce}`;

  const handleReset = () => {
    if (!isDefined(selectedRecipient)) {
      return;
    }
    composerState.resetRecipientOverride(selectedRecipient.personId);
    setResetNonce((previousNonce) => previousNonce + 1);
  };

  const sendButtonTitle = composerState.sending
    ? t`Sending ${composerState.sentCount}/${recipientCount}…`
    : t`Send ${recipientCount} emails`;

  return (
    <StyledMain>
      <StyledCard>
        <StyledFieldRow>
          <StyledFieldLabel>{t`From`}</StyledFieldLabel>
          <StyledFieldValue>
            {accountOptions.length > 1 ? (
              <Select
                dropdownId="mass-email-from-account"
                value={composerState.connectedAccountId}
                options={accountOptions}
                onChange={(value) => composerState.setConnectedAccountId(value)}
              />
            ) : (
              (currentAccountHandle ?? '')
            )}
          </StyledFieldValue>
        </StyledFieldRow>
        <StyledFieldRow>
          <StyledFieldLabel>{t`To`}</StyledFieldLabel>
          <StyledFieldValue>
            {isDefined(selectedRecipient) ? (
              <>
                <Avatar
                  avatarUrl={getAbsoluteImageUrl(selectedRecipient.avatarUrl)}
                  placeholder={selectedRecipient.displayName}
                  placeholderColorSeed={selectedRecipient.personId}
                  size="sm"
                  type="rounded"
                />
                {selectedRecipient.displayName}
                <StyledSecondaryText>
                  {selectedRecipient.email}
                </StyledSecondaryText>
              </>
            ) : (
              <>
                <Avatar
                  Icon={IconUsers}
                  placeholder={t`Everyone`}
                  size="sm"
                  type="rounded"
                />
                {t`Everyone`}
                <StyledSecondaryText>
                  {t`${recipientCount} recipients`}
                </StyledSecondaryText>
              </>
            )}
          </StyledFieldValue>
        </StyledFieldRow>
        <StyledSubjectInput
          value={
            isDefined(resolved)
              ? resolved.subject
              : composerState.subjectTemplate
          }
          onChange={(event) => {
            if (isDefined(selectedRecipient)) {
              composerState.setRecipientSubject(
                selectedRecipient.personId,
                event.target.value,
              );
            } else {
              composerState.setSubjectTemplate(event.target.value);
            }
          }}
          placeholder={t`Subject`}
        />
        <StyledBodyContainer>
          <FormAdvancedTextFieldInput
            key={editorKey}
            defaultValue={
              isDefined(resolved) ? resolved.body : composerState.bodyTemplate
            }
            onChange={(value) => {
              if (isDefined(selectedRecipient)) {
                composerState.setRecipientBody(
                  selectedRecipient.personId,
                  value,
                );
              } else {
                composerState.setBodyTemplate(value);
              }
            }}
            placeholder={t`Write your email…`}
            preset="inlineEmailBody"
            minHeight={260}
          />
        </StyledBodyContainer>
        {!isDefined(selectedRecipient) && (
          <StyledTokensRow>
            {t`Personalize for each recipient with placeholders:`}{' '}
            {EMAIL_PLACEHOLDER_KEYS.map((placeholderKey) => (
              <StyledPlaceholderToken key={placeholderKey}>
                {`{${placeholderKey}}`}
              </StyledPlaceholderToken>
            ))}
          </StyledTokensRow>
        )}
        {isDefined(resolved) && resolved.missingPlaceholderKeys.length > 0 && (
          <StyledMissingWarning>
            {t`Missing data for:`}{' '}
            {resolved.missingPlaceholderKeys
              .map((placeholderKey) => `{${placeholderKey}}`)
              .join(', ')}
          </StyledMissingWarning>
        )}
        {isDefined(resolved) && resolved.isCustomized && (
          <StyledCustomizedRow>
            {t`Customized for this recipient`}
            <LightIconButton
              Icon={IconRestore}
              size="small"
              accent="tertiary"
              onClick={handleReset}
            />
          </StyledCustomizedRow>
        )}
        <StyledFooter>
          <Button
            size="small"
            variant="primary"
            accent="blue"
            title={sendButtonTitle}
            Icon={IconSend}
            onClick={composerState.handleSend}
            disabled={!composerState.canSend}
          />
        </StyledFooter>
      </StyledCard>
    </StyledMain>
  );
};
