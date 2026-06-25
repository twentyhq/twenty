import { styled } from '@linaria/react';
import { useCallback, useMemo } from 'react';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { type ReplyContextReady } from '@/activities/emails/hooks/useReplyContext';
import { EmailThreadComposerFooterEffect } from '@/page-layout/widgets/email-thread/components/EmailThreadComposerFooterEffect';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { type SidePanelFooterCommandMenuItem } from '@/ui/layout/side-panel/types/SidePanelFooterCommandMenuItem';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { t } from '@lingui/core/macro';
import { IconArrowBackUp, IconSend, IconX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledReplyBar = styled.button`
  align-items: center;
  all: unset;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    color: ${themeCssVariables.font.color.secondary};
  }
`;

type EmailThreadComposerProps = {
  replyContext: ReplyContextReady;
  isInSidePanel: boolean;
  isComposerOpen: boolean;
  setIsComposerOpen: (open: boolean) => void;
};

export const EmailThreadComposer = ({
  replyContext,
  isInSidePanel,
  isComposerOpen,
  setIsComposerOpen,
}: EmailThreadComposerProps) => {
  const handleReplySent = useCallback(() => {
    setIsComposerOpen(false);
  }, [setIsComposerOpen]);

  const composerState = useEmailComposerState({
    connectedAccountId: replyContext.connectedAccountId,
    defaultTo: replyContext.to,
    defaultSubject: replyContext.subject,
    defaultInReplyTo: replyContext.inReplyTo,
    onSent: handleReplySent,
  });

  const { handleSend, canSend } = composerState;

  const footerCommandMenuItems =
    useMemo((): SidePanelFooterCommandMenuItem[] => {
      if (!isComposerOpen) {
        return [
          {
            id: 'reply',
            label: t`Reply`,
            Icon: IconArrowBackUp,
            isPrimaryCTA: true,
            onClick: () => setIsComposerOpen(true),
          },
        ];
      }

      return [
        {
          id: 'cancel-reply',
          label: t`Cancel reply`,
          Icon: IconX,
          isPinned: false,
          onClick: () => setIsComposerOpen(false),
        },
        {
          id: 'send',
          label: t`Send`,
          Icon: IconSend,
          isPrimaryCTA: true,
          hotkeys: [getOsControlSymbol(), '⏎'],
          onClick: handleSend,
          disabled: !canSend,
        },
      ];
    }, [isComposerOpen, handleSend, canSend, setIsComposerOpen]);

  const handleSendHotkey = useCallback(() => {
    if (isComposerOpen && canSend) {
      handleSend();
    }
  }, [isComposerOpen, canSend, handleSend]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSendHotkey,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSendHotkey],
  });

  return (
    <>
      {isInSidePanel && (
        <EmailThreadComposerFooterEffect
          footerCommandMenuItems={footerCommandMenuItems}
        />
      )}
      {isComposerOpen ? (
        <EmailComposerFields composerState={composerState} />
      ) : (
        !isInSidePanel && (
          <StyledReplyBar onClick={() => setIsComposerOpen(true)}>
            <IconArrowBackUp size={16} />
            {t`Reply...`}
          </StyledReplyBar>
        )
      )}
    </>
  );
};
