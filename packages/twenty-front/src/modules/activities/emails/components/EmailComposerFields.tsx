import { EmailOperation } from 'twenty-shared/types';
import { useQuery } from '@apollo/client/react';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
} from 'twenty-shared/utils';
import { IconPaperclip } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/components/input';
import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { ComposerHeader } from '@/activities/components/ComposerHeader';
import { EmailAttachmentsField } from '@/activities/emails/components/EmailAttachmentsField';
import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { EmailRecipientsFields } from '@/activities/emails/recipients/components/EmailRecipientsFields';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { getEmailComposerSenderPicker } from '@/activities/emails/utils/getEmailComposerSenderPicker';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { useLingui } from '@lingui/react/macro';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledAttachments = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const ATTACH_ACTION_CLASS_NAME = css`
  align-self: flex-start;
`;

const StyledRecipientLimitWarning = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
`;

type EmailComposerFieldsProps = {
  composerState: EmailComposerState;
  contextRecord?: EmailComposerContextRecord | null;
  // For surfaces without a composer footer of their own.
  onAttachFiles?: () => void;
  appSender?: Pick<AppReplyTarget, 'connectedAccountId' | 'handle'> | null;
};

export const EmailComposerFields = ({
  composerState,
  contextRecord,
  onAttachFiles,
  appSender,
}: EmailComposerFieldsProps) => {
  const { t } = useLingui();
  const { uploadEmailImage } = useUploadEmailImage();
  const { data: accountsData } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'handleAliases' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const sendableAccounts = (accountsData?.myConnectedAccounts ?? []).filter(
    (connectedAccount) =>
      canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      }),
  );

  const {
    options: senderOptions,
    selectedValue: selectedSenderValue,
    getSenderForValue,
  } = getEmailComposerSenderPicker({
    sendableAccounts,
    appSender,
    sender: composerState,
  });

  const hasMultipleSenders = senderOptions.length > 1;

  const handleSenderChange = (value: string) => {
    const nextSender = getSenderForValue(value);

    if (isDefined(nextSender)) {
      composerState.setSender(nextSender);
    }
  };

  return (
    <StyledFieldsContainer>
      <ComposerHeader>
        {hasMultipleSenders && (
          <ComposerFieldRow label={t`From`}>
            <Select
              dropdownId="email-composer-from-account"
              fullWidth
              variant="transparent"
              value={selectedSenderValue}
              options={senderOptions}
              onChange={handleSenderChange}
            />
          </ComposerFieldRow>
        )}
        <EmailRecipientsFields
          recipientsByFieldId={composerState.recipientsByFieldId}
          onChange={composerState.setRecipientsByFieldId}
          onSubmit={composerState.handleSend}
          contextRecord={contextRecord}
        />
        <ComposerFieldRow label={t`Subject`} hasDivider={false}>
          <Input
            variant="plain"
            type="text"
            aria-label={t`Subject`}
            value={composerState.subject}
            onChange={(event) => composerState.setSubject(event.target.value)}
          />
        </ComposerFieldRow>
      </ComposerHeader>
      {composerState.exceedsRecipientLimit && (
        <StyledRecipientLimitWarning>
          {t`Too many recipients (${composerState.recipientCount}/${composerState.maxRecipients}).`}
        </StyledRecipientLimitWarning>
      )}
      <StyledBody>
        <FormAdvancedTextFieldInput
          value={composerState.body}
          onChange={composerState.setBody}
          profile={INLINE_EMAIL_BODY_EDITOR_PROFILE}
          onImageUpload={uploadEmailImage}
        />
      </StyledBody>
      {(composerState.files.length > 0 || isDefined(onAttachFiles)) && (
        <StyledAttachments>
          {isDefined(onAttachFiles) && (
            <LightButton
              className={ATTACH_ACTION_CLASS_NAME}
              emphasis="subtle"
              size="sm"
              startIcon={<IconPaperclip />}
              onClick={onAttachFiles}
            >
              {t`Attach files`}
            </LightButton>
          )}
          {composerState.files.length > 0 && (
            <EmailAttachmentsField
              files={composerState.files}
              onChange={composerState.setFiles}
            />
          )}
        </StyledAttachments>
      )}
    </StyledFieldsContainer>
  );
};
