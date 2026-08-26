import { useQuery } from '@apollo/client/react';
import { useContext } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { getSendableEmailHandles, isDefined } from 'twenty-shared/utils';
import { IconPaperclip } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { ComposerHeader } from '@/activities/components/ComposerHeader';
import { StyledComposerTextInput } from '@/activities/components/ComposerTextInput';
import { EmailAttachmentsField } from '@/activities/emails/components/EmailAttachmentsField';
import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { useEmailRecipientsDragAndDrop } from '@/activities/emails/recipients/hooks/useEmailRecipientsDragAndDrop';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { buildConnectedAccountSenderOptions } from '@/accounts/utils/buildConnectedAccountSenderOptions';
import { canConnectedAccountSendEmail } from '@/accounts/utils/canConnectedAccountSendEmail';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { Select } from '@/ui/input/components/Select';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

const StyledFieldsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  width: 100%;
`;

const StyledCcBccToggle = styled.button`
  all: unset;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  padding: 0 ${themeCssVariables.spacing[1]};

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
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

const StyledAttachAction = styled.button`
  align-items: center;
  align-self: flex-start;
  all: unset;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: 2px;
  }
`;

const StyledRecipientLimitWarning = styled.div`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
`;

type EmailComposerFieldsProps = {
  composerState: EmailComposerState;
  contextRecord?: EmailComposerContextRecord | null;
  // Surfaces without a composer footer of their own pass this so attaching
  // stays reachable from inside the form.
  onAttachFiles?: () => void;
};

export const EmailComposerFields = ({
  composerState,
  contextRecord,
  onAttachFiles,
}: EmailComposerFieldsProps) => {
  const { theme } = useContext(ThemeContext);
  const { uploadEmailImage } = useUploadEmailImage();
  const { data: accountsData } = useQuery<{
    myConnectedAccounts: Pick<
      ConnectedAccount,
      'id' | 'handle' | 'handleAliases' | 'provider' | 'connectionParameters'
    >[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const sendableAccounts = (accountsData?.myConnectedAccounts ?? []).filter(
    canConnectedAccountSendEmail,
  );

  const senderOptions = buildConnectedAccountSenderOptions(sendableAccounts);

  const hasMultipleSenders = senderOptions.length > 1;

  const selectedAccount = sendableAccounts.find(
    (account) => account.id === composerState.connectedAccountId,
  );

  const selectedSenderValue =
    composerState.fromHandle ?? selectedAccount?.handle;

  const handleSenderChange = (handle: string) => {
    const senderAccount = sendableAccounts.find((account) =>
      getSendableEmailHandles(account).includes(handle),
    );

    if (!isDefined(senderAccount)) {
      return;
    }

    composerState.setSender({
      connectedAccountId: senderAccount.id,
      fromHandle: handle,
    });
  };

  const allRecipientKeys = [
    ...composerState.to,
    ...composerState.cc,
    ...composerState.bcc,
  ].map((recipient) => getEmailRecipientKey(recipient.address));

  const recipientsByFieldId: EmailRecipientsByFieldId = {
    to: composerState.to,
    cc: composerState.cc,
    bcc: composerState.bcc,
  };

  const handleRecipientsByFieldIdChange = (
    nextRecipientsByFieldId: EmailRecipientsByFieldId,
  ) => {
    composerState.setTo(nextRecipientsByFieldId.to);
    composerState.setCc(nextRecipientsByFieldId.cc);
    composerState.setBcc(nextRecipientsByFieldId.bcc);

    if (
      nextRecipientsByFieldId.cc.length > 0 ||
      nextRecipientsByFieldId.bcc.length > 0
    ) {
      composerState.setShowCcBcc(true);
    }
  };

  const { contextValues, draggedRecipients, handlers } =
    useEmailRecipientsDragAndDrop({
      recipientsByFieldId,
      onRecipientsByFieldIdChange: handleRecipientsByFieldIdChange,
    });

  const isDraggingRecipients = isDefined(draggedRecipients);

  const getDraggedIndicesForField = (fieldId: EmailRecipientsFieldId) =>
    draggedRecipients?.fieldId === fieldId ? draggedRecipients.indices : null;

  const areCcBccFieldsVisible = composerState.showCcBcc || isDraggingRecipients;

  return (
    <StyledFieldsContainer>
      <DragDropItemDndContext.Provider value={contextValues}>
        <DragDropProvider<EmailRecipientDragData>
          sensors={DND_KIT_SENSORS}
          plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          <ComposerHeader>
            {hasMultipleSenders && (
              <ComposerFieldRow label={t`From`}>
                <Select
                  dropdownId="email-composer-from-account"
                  fullWidth
                  value={selectedSenderValue}
                  options={senderOptions}
                  onChange={handleSenderChange}
                />
              </ComposerFieldRow>
            )}
            <ComposerFieldRow
              label={t`To`}
              trailing={
                !areCcBccFieldsVisible && (
                  <StyledCcBccToggle
                    onClick={() => composerState.setShowCcBcc(true)}
                  >
                    {t`Cc/Bcc`}
                  </StyledCcBccToggle>
                )
              }
            >
              <EmailRecipientsFieldInput
                fieldId="to"
                draggedSourceIndices={getDraggedIndicesForField('to')}
                label={t`To`}
                recipients={composerState.to}
                onChange={composerState.setTo}
                onSubmit={composerState.handleSend}
                excludedSuggestionKeys={allRecipientKeys}
                contextRecord={contextRecord}
              />
            </ComposerFieldRow>
            {areCcBccFieldsVisible && (
              <>
                <ComposerFieldRow label={t`Cc`}>
                  <EmailRecipientsFieldInput
                    fieldId="cc"
                    draggedSourceIndices={getDraggedIndicesForField('cc')}
                    label={t`Cc`}
                    recipients={composerState.cc}
                    onChange={composerState.setCc}
                    onSubmit={composerState.handleSend}
                    excludedSuggestionKeys={allRecipientKeys}
                    contextRecord={contextRecord}
                  />
                </ComposerFieldRow>
                <ComposerFieldRow label={t`Bcc`}>
                  <EmailRecipientsFieldInput
                    fieldId="bcc"
                    draggedSourceIndices={getDraggedIndicesForField('bcc')}
                    label={t`Bcc`}
                    recipients={composerState.bcc}
                    onChange={composerState.setBcc}
                    onSubmit={composerState.handleSend}
                    excludedSuggestionKeys={allRecipientKeys}
                    contextRecord={contextRecord}
                  />
                </ComposerFieldRow>
              </>
            )}
            <ComposerFieldRow label={t`Subject`}>
              <StyledComposerTextInput
                type="text"
                aria-label={t`Subject`}
                defaultValue={composerState.initialSubject}
                onChange={(event) =>
                  composerState.setSubject(event.target.value)
                }
              />
            </ComposerFieldRow>
          </ComposerHeader>
        </DragDropProvider>
      </DragDropItemDndContext.Provider>
      {composerState.exceedsRecipientLimit && (
        <StyledRecipientLimitWarning>
          {t`Too many recipients (${composerState.recipientCount}/${composerState.maxRecipients}).`}
        </StyledRecipientLimitWarning>
      )}
      <StyledBody>
        <FormAdvancedTextFieldInput
          defaultValue={composerState.initialBody}
          onChange={composerState.setBody}
          placeholder={t`Type something or press "/" to see commands`}
          profile={INLINE_EMAIL_BODY_EDITOR_PROFILE}
          onImageUpload={uploadEmailImage}
        />
      </StyledBody>
      {(composerState.files.length > 0 || isDefined(onAttachFiles)) && (
        <StyledAttachments>
          {isDefined(onAttachFiles) && (
            <StyledAttachAction type="button" onClick={onAttachFiles}>
              <IconPaperclip size={theme.icon.size.sm} />
              {t`Attach files`}
            </StyledAttachAction>
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
