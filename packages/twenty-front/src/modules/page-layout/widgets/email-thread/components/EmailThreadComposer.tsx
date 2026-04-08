import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo } from 'react';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { type ReplyContextReady } from '@/activities/emails/hooks/useReplyContext';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { sidePanelWidgetFooterActionsState } from '@/ui/layout/side-panel/states/sidePanelWidgetFooterActionsState';
import { type SidePanelFooterAction } from '@/ui/layout/side-panel/types/SidePanelFooterAction';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { t } from '@lingui/core/macro';
import { IconArrowBackUp, IconSend, IconX } from 'twenty-ui/display';
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

  const setSidePanelWidgetFooterActions = useSetAtomState(
    sidePanelWidgetFooterActionsState,
  );

  const footerActions = useMemo((): SidePanelFooterAction[] => {
    if (!isComposerOpen) {
      return [
        {
          key: 'reply',
          label: t`Reply`,
          Icon: IconArrowBackUp,
          isPrimaryCTA: true,
          onClick: () => setIsComposerOpen(true),
        },
      ];
    }

    return [
      {
        key: 'cancel-reply',
        label: t`Cancel reply`,
        Icon: IconX,
        isPinned: false,
        onClick: () => setIsComposerOpen(false),
      },
      {
        key: 'send',
        label: t`Send`,
        Icon: IconSend,
        isPrimaryCTA: true,
        hotkeys: [getOsControlSymbol(), '⏎'],
        onClick: composerState.handleSend,
        disabled: !composerState.canSend,
      },
    ];
  }, [
    isComposerOpen,
    composerState.handleSend,
    composerState.canSend,
    setIsComposerOpen,
  ]);

  useEffect(() => {
    if (!isInSidePanel) {
      return;
    }

    setSidePanelWidgetFooterActions(footerActions);

    return () => setSidePanelWidgetFooterActions([]);
  }, [isInSidePanel, footerActions, setSidePanelWidgetFooterActions]);

  const handleSendHotkey = useCallback(() => {
    if (isComposerOpen && composerState.canSend) {
      composerState.handleSend();
    }
  }, [isComposerOpen, composerState.canSend, composerState.handleSend]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSendHotkey,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSendHotkey],
  });

  if (!isComposerOpen) {
    if (isInSidePanel) {
      return null;
    }

    return (
      <StyledReplyBar onClick={() => setIsComposerOpen(true)}>
        <IconArrowBackUp size={16} />
        {t`Reply...`}
      </StyledReplyBar>
    );
  }

  return <EmailComposerFields composerState={composerState} />;
};
