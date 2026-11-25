import { useCallback, useMemo } from 'react';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { useAttachEmailFiles } from '@/activities/emails/hooks/useAttachEmailFiles';
import { type ReplyContextReady } from '@/activities/emails/hooks/useReplyContext';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
import { type EmailReplyMode } from '@/activities/emails/types/EmailReplyMode';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type WidgetCommandMenuItem } from '@/command-menu-item/types/WidgetCommandMenuItem';
import { EmailThreadComposerCommandMenuItemsEffect } from '@/page-layout/widgets/email-thread/components/EmailThreadComposerCommandMenuItemsEffect';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowBackUp,
  IconArrowBackUpDouble,
  IconPaperclip,
  IconSend,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { PageFocusId } from '@/types/PageFocusId';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const StyledComposerContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type EmailThreadComposerProps = {
  replyContext: ReplyContextReady;
  isInSidePanel: boolean;
  isComposerOpen: boolean;
  onComposerOpen: (replyMode: EmailReplyMode) => void;
  onComposerClose: () => void;
  replyMode: EmailReplyMode;
  draftPrefill?: EmailDraftPrefill | null;
  draftKey?: string;
  appReplyTarget?: AppReplyTarget | null;
};

export const EmailThreadComposer = ({
  replyContext,
  isInSidePanel,
  isComposerOpen,
  onComposerOpen,
  onComposerClose,
  replyMode,
  draftPrefill,
  draftKey,
  appReplyTarget,
}: EmailThreadComposerProps) => {
  const { t } = useLingui();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const handleReplySent = useCallback(
    (messageThreadId: string | null) => {
      onComposerClose();

      if (isDefined(messageThreadId)) {
        openRecordInSidePanel({
          recordId: messageThreadId,
          objectNameSingular: StandardObjectNameSingular.MessageThread,
        });
      }
    },
    [onComposerClose, openRecordInSidePanel],
  );

  const replyAllRecipients =
    replyMode === 'replyAll' ? replyContext.replyAll : null;

  const composerState = useEmailComposerState({
    connectedAccountId: replyContext.connectedAccountId,
    draftPrefill,
    defaultTo: replyAllRecipients?.to ?? replyContext.to,
    defaultCc: replyAllRecipients?.cc,
    defaultSubject: replyContext.subject,
    defaultInReplyTo: replyContext.inReplyTo,
    appReplyTarget,
    draftKey,
    onSent: handleReplySent,
  });

  const { handleSend, canSend, discardDraft } = composerState;

  const {
    openAttachmentPicker,
    discardPendingUploads,
    isUploadingAttachments,
  } = useAttachEmailFiles({
    onFilesAttached: composerState.setFiles,
  });

  const canSendReply = canSend && !isUploadingAttachments;

  const widgetCommandMenuItems = useMemo((): WidgetCommandMenuItem[] => {
    if (!isComposerOpen) {
      const canReplyAll = isDefined(replyContext.replyAll);

      const replyCommandMenuItem: WidgetCommandMenuItem = {
        id: 'reply',
        label: t`Reply`,
        Icon: IconArrowBackUp,
        isPrimaryCTA: !canReplyAll,
        onClick: () => onComposerOpen('reply'),
        replacedEngineComponentKey: EngineComponentKey.REPLY_TO_EMAIL_THREAD,
      };

      if (!canReplyAll) {
        return [replyCommandMenuItem];
      }

      return [
        replyCommandMenuItem,
        {
          id: 'reply-all',
          label: t`Reply all`,
          Icon: IconArrowBackUpDouble,
          isPrimaryCTA: true,
          onClick: () => onComposerOpen('replyAll'),
          replacedEngineComponentKey: EngineComponentKey.REPLY_TO_EMAIL_THREAD,
        },
      ];
    }

    const cancelReplyCommandMenuItem: WidgetCommandMenuItem = {
      id: 'cancel-reply',
      label: t`Cancel reply`,
      Icon: IconX,
      isPinned: !isInSidePanel,
      onClick: () => {
        discardPendingUploads();
        discardDraft();
        onComposerClose();
      },
      replacedEngineComponentKey: EngineComponentKey.REPLY_TO_EMAIL_THREAD,
    };

    const sendCommandMenuItem: WidgetCommandMenuItem = {
      id: 'send',
      label: t`Send`,
      Icon: IconSend,
      isPrimaryCTA: true,
      shortcut: ['Mod', 'Enter'],
      onClick: handleSend,
      disabled: !canSendReply,
      replacedEngineComponentKey: EngineComponentKey.REPLY_TO_EMAIL_THREAD,
    };

    if (!isInSidePanel) {
      return [cancelReplyCommandMenuItem, sendCommandMenuItem];
    }

    return [
      cancelReplyCommandMenuItem,
      {
        id: 'attach-files',
        label: t`Attach files`,
        Icon: IconPaperclip,
        isPinned: false,
        onClick: openAttachmentPicker,
      },
      sendCommandMenuItem,
    ];
  }, [
    isComposerOpen,
    isInSidePanel,
    replyContext.replyAll,
    handleSend,
    canSendReply,
    onComposerOpen,
    onComposerClose,
    openAttachmentPicker,
    discardPendingUploads,
    discardDraft,
    t,
  ]);

  const handleSendHotkey = useCallback(() => {
    if (isComposerOpen && canSendReply) {
      handleSend();
    }
  }, [isComposerOpen, canSendReply, handleSend]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSendHotkey,
    focusId: isInSidePanel ? SIDE_PANEL_FOCUS_ID : PageFocusId.RecordShowPage,
    dependencies: [handleSendHotkey],
  });

  return (
    <>
      <EmailThreadComposerCommandMenuItemsEffect
        commandMenuItems={widgetCommandMenuItems}
        isInSidePanel={isInSidePanel}
      />
      {isComposerOpen && (
        <StyledComposerContainer>
          <EmailComposerFields
            composerState={composerState}
            appSender={appReplyTarget}
            onAttachFiles={isInSidePanel ? undefined : openAttachmentPicker}
          />
        </StyledComposerContainer>
      )}
    </>
  );
};
