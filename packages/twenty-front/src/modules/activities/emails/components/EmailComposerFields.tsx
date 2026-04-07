import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';

import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { FormMultiTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiTextFieldInput';
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

type EmailComposerFieldsProps = {
  composerState: EmailComposerState;
};

export const EmailComposerFields = ({
  composerState,
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
        <FormMultiTextFieldInput
          label={t`To`}
          defaultValue={composerState.defaultTo}
          onChange={composerState.setTo}
          placeholder={t`Recipients`}
        />
        {!composerState.showCcBcc && (
          <StyledCcBccToggle onClick={() => composerState.setShowCcBcc(true)}>
            {t`Cc/Bcc`}
          </StyledCcBccToggle>
        )}
      </StyledToRow>
      {composerState.showCcBcc && (
        <>
          <FormMultiTextFieldInput
            label={t`Cc`}
            defaultValue=""
            onChange={composerState.setCc}
            placeholder={t`Cc`}
          />
          <FormMultiTextFieldInput
            label={t`Bcc`}
            defaultValue=""
            onChange={composerState.setBcc}
            placeholder={t`Bcc`}
          />
        </>
      )}
      <FormTextFieldInput
        label={t`Subject`}
        defaultValue={composerState.defaultSubject}
        onChange={composerState.setSubject}
        placeholder={t`Subject`}
      />
      <FormAdvancedTextFieldInput
        defaultValue=""
        onChange={composerState.setBody}
        placeholder={t`Type something or press "/" to see commands`}
        minHeight={120}
        maxWidth={600}
        contentType="json"
      />
    </StyledFieldsContainer>
  );
};
