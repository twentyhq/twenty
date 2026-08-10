import { useQuery } from '@apollo/client/react';
import { DragDropProvider } from '@dnd-kit/react';
import { styled } from '@linaria/react';

import { EmailAttachmentsField } from '@/activities/emails/components/EmailAttachmentsField';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { useEmailRecipientsDragAndDrop } from '@/activities/emails/recipients/hooks/useEmailRecipientsDragAndDrop';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';
import { type EmailRecipientDragData } from '@/activities/emails/recipients/types/EmailRecipientDragData';
import { type EmailRecipientsFieldId } from '@/activities/emails/recipients/types/EmailRecipientsFieldId';
import { getEmailRecipientKey } from '@/activities/emails/recipients/utils/getEmailRecipientKey';
import { type EmailRecipientsByFieldId } from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { isDefined } from 'twenty-shared/utils';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import { DragDropItemDndContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemDndContext';
import { INLINE_EMAIL_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
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
  const { uploadEmailImage } = useUploadEmailImage();
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
      <DragDropItemDndContext.Provider value={contextValues}>
        <DragDropProvider<EmailRecipientDragData>
          sensors={DND_KIT_SENSORS}
          plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION}
          onDragStart={handlers.onDragStart}
          onDragMove={handlers.onDragMove}
          onDragEnd={handlers.onDragEnd}
        >
          <StyledToRow>
            <EmailRecipientsFieldInput
              fieldId="to"
              draggedSourceIndices={getDraggedIndicesForField('to')}
              label={t`To`}
              placeholder={t`Recipients`}
              recipients={composerState.to}
              onChange={composerState.setTo}
              onSubmit={composerState.handleSend}
              excludedSuggestionKeys={allRecipientKeys}
              contextRecord={contextRecord}
            />
            {!areCcBccFieldsVisible && (
              <StyledCcBccToggle
                onClick={() => composerState.setShowCcBcc(true)}
              >
                {t`Cc/Bcc`}
              </StyledCcBccToggle>
            )}
          </StyledToRow>
          {areCcBccFieldsVisible && (
            <>
              <EmailRecipientsFieldInput
                fieldId="cc"
                draggedSourceIndices={getDraggedIndicesForField('cc')}
                label={t`Cc`}
                placeholder={t`Cc`}
                recipients={composerState.cc}
                onChange={composerState.setCc}
                onSubmit={composerState.handleSend}
                excludedSuggestionKeys={allRecipientKeys}
                contextRecord={contextRecord}
              />
              <EmailRecipientsFieldInput
                fieldId="bcc"
                draggedSourceIndices={getDraggedIndicesForField('bcc')}
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
        </DragDropProvider>
      </DragDropItemDndContext.Provider>
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
        profile={INLINE_EMAIL_BODY_EDITOR_PROFILE}
        onImageUpload={uploadEmailImage}
      />
      <EmailAttachmentsField
        label={t`Attachments`}
        files={composerState.files}
        onChange={composerState.setFiles}
      />
    </StyledFieldsContainer>
  );
};
