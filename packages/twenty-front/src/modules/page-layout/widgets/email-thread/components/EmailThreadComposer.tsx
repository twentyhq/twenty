import { useCallback, useMemo } from 'react';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { useAttachEmailFiles } from '@/activities/emails/hooks/useAttachEmailFiles';
import { type ReplyContextReady } from '@/activities/emails/hooks/useReplyContext';
import { type AppReplyTarget } from '@/activities/emails/types/AppReplyTarget';
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
  setIsComposerOpen: (open: boolean) => void;
  draftPrefill?: EmailDraftPrefill | null;
  appReplyTarget?: AppReplyTarget | null;
};

export const EmailThreadComposer = ({
  replyContext,
  isInSidePanel,
  isComposerOpen,
  setIsComposerOpen,
  draftPrefill,
  appReplyTarget,
}: EmailThreadComposerProps) => {
  const { t } = useLingui();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const handleReplySent = useCallback(
    (messageThreadId: string | null) => {
      setIsComposerOpen(false);

      if (isDefined(messageThreadId)) {
        openRecordInSidePanel({
          recordId: messageThreadId,
          objectNameSingular: StandardObjectNameSingular.MessageThread,
        });
      }
    },
    [setIsComposerOpen, openRecordInSidePanel],
  );

  const composerState = useEmailComposerState({
    connectedAccountId: replyContext.connectedAccountId,
    draftPrefill,
    defaultTo: replyContext.to,
    defaultSubject: replyContext.subject,
    defaultInReplyTo: replyContext.inReplyTo,
    appReplyTarget,
    onSent: handleReplySent,
  });

  // app sends carry no files yet
  const canAttachFiles =
    appReplyTarget?.connectedAccountId !== composerState.connectedAccountId;

  const { handleSend, canSend } = composerState;

  const { openAttachmentPicker, isUploadingAttachments } = useAttachEmailFiles({
    onFilesAttached: composerState.setFiles,
  });

  const canSendReply = canSend && !isUploadingAttachments;

  const widgetCommandMenuItems = useMemo((): WidgetCommandMenuItem[] => {
    if (!isComposerOpen) {
      return [
        {
          id: 'reply',
          label: t`Reply`,
          Icon: IconArrowBackUp,
          isPrimaryCTA: true,
          onClick: () => setIsComposerOpen(true),
          replacedEngineComponentKey: EngineComponentKey.REPLY_TO_EMAIL_THREAD,
        },
      ];
    }

    const cancelReplyCommandMenuItem: WidgetCommandMenuItem = {
      id: 'cancel-reply',
      label: t`Cancel reply`,
      Icon: IconX,
      isPinned: !isInSidePanel,
      onClick: () => setIsComposerOpen(false),
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
      ...(canAttachFiles
        ? [
            {
              id: 'attach-files',
              label: t`Attach files`,
              Icon: IconPaperclip,
              isPinned: false,
              onClick: openAttachmentPicker,
            },
          ]
        : []),
      sendCommandMenuItem,
    ];
  }, [
    isComposerOpen,
    isInSidePanel,
    canAttachFiles,
    handleSend,
    canSendReply,
    setIsComposerOpen,
    openAttachmentPicker,
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
            onAttachFiles={
              isInSidePanel || !canAttachFiles
                ? undefined
                : openAttachmentPicker
            }
          />
        </StyledComposerContainer>
      )}
    </>
  );
};
