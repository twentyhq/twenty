import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';

import { EmailAttachmentsField } from '@/activities/emails/components/EmailAttachmentsField';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledToRow = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const StyledCcBccToggle = styled.button`
  all: unset;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  position: absolute;
  right: 0;
  top: 0;

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const StyledRecipientLimitWarning = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
`;

type EmailComposerFieldsProps = {
  composerState: EmailComposerState;
  contextRecord?: EmailComposerContextRecord | null;
};

export const EmailComposerFields = ({
  composerState,
  contextRecord,
}: EmailComposerFieldsProps) => {
  const { data: accountsData } = useQuery<{
    myConnectedAccounts: { id: string; handle: string }[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const accountOptions: SelectOption<string>[] =
    accountsData?.myConnectedAccounts?.map((account) => ({
      label: account.handle,
      value: account.id,
    })) ?? [];

  const hasMultipleAccounts = accountOptions.length > 1;

  const allRecipientKeys = [
    ...composerState.to,
    ...composerState.cc,
    ...composerState.bcc,
  ].map((recipient) => getEmailRecipientKey(recipient.address));

  return (
    <StyledFieldsContainer>
      {hasMultipleAccounts && (
        <Select
          dropdownId="email-composer-from-account"
          label={t`From`}
          fullWidth
          value={composerState.connectedAccountId}
          options={accountOptions}
          onChange={(value) => composerState.setConnectedAccountId(value)}
        />
      )}
      <StyledToRow>
        <EmailRecipientsFieldInput
          label={t`To`}
          placeholder={t`Recipients`}
          recipients={composerState.to}
          onChange={composerState.setTo}
          onSubmit={composerState.handleSend}
          excludedSuggestionKeys={allRecipientKeys}
          contextRecord={contextRecord}
        />
        {!composerState.showCcBcc && (
          <StyledCcBccToggle onClick={() => composerState.setShowCcBcc(true)}>
            {t`Cc/Bcc`}
          </StyledCcBccToggle>
        )}
      </StyledToRow>
      {composerState.showCcBcc && (
        <>
          <EmailRecipientsFieldInput
            label={t`Cc`}
            placeholder={t`Cc`}
            recipients={composerState.cc}
            onChange={composerState.setCc}
            onSubmit={composerState.handleSend}
            excludedSuggestionKeys={allRecipientKeys}
            contextRecord={contextRecord}
          />
          <EmailRecipientsFieldInput
            label={t`Bcc`}
            placeholder={t`Bcc`}
            recipients={composerState.bcc}
            onChange={composerState.setBcc}
            onSubmit={composerState.handleSend}
            excludedSuggestionKeys={allRecipientKeys}
            contextRecord={contextRecord}
          />
        </>
      )}
      {composerState.exceedsRecipientLimit && (
        <StyledRecipientLimitWarning>
          {t`Too many recipients (${composerState.recipientCount}/${composerState.maxRecipients}).`}
        </StyledRecipientLimitWarning>
      )}
      <FormTextFieldInput
        label={t`Subject`}
        defaultValue={composerState.initialSubject}
        onChange={composerState.setSubject}
        placeholder={t`Subject`}
      />
      <FormAdvancedTextFieldInput
        defaultValue={composerState.initialBody}
        onChange={composerState.setBody}
        placeholder={t`Type something or press "/" to see commands`}
        minHeight={120}
        maxWidth={600}
        contentType="html"
      />
      <EmailAttachmentsField
        label={t`Attachments`}
        files={composerState.files}
        onChange={composerState.setFiles}
      />
    </StyledFieldsContainer>
  );
};
