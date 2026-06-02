import { useCallback } from 'react';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import { composeEmailDefaultInReplyToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultInReplyToComponentState';
import { composeEmailDefaultSubjectComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultSubjectComponentState';
import { composeEmailDefaultToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultToComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSend } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { getOsControlSymbol } from 'twenty-ui/utilities';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

export const SidePanelComposeEmailPage = () => {
  const composeEmailConnectedAccountId = useAtomComponentStateValue(
    composeEmailConnectedAccountIdComponentState,
  );
  const composeEmailDefaultTo = useAtomComponentStateValue(
    composeEmailDefaultToComponentState,
  );
  const composeEmailDefaultSubject = useAtomComponentStateValue(
    composeEmailDefaultSubjectComponentState,
  );
  const composeEmailDefaultInReplyTo = useAtomComponentStateValue(
    composeEmailDefaultInReplyToComponentState,
  );

  const { goBackFromSidePanel } = useSidePanelHistory();

  const composerState = useEmailComposerState({
    connectedAccountId: composeEmailConnectedAccountId ?? '',
    defaultTo: composeEmailDefaultTo ?? '',
    defaultSubject: composeEmailDefaultSubject ?? '',
    defaultInReplyTo: composeEmailDefaultInReplyTo ?? undefined,
    onSent: goBackFromSidePanel,
  });

  const handleSendHotkey = useCallback(() => {
    if (composerState.canSend) {
      composerState.handleSend();
    }
  }, [composerState]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSendHotkey,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSendHotkey],
  });

  if (!composeEmailConnectedAccountId) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledContent>
        <EmailComposerFields composerState={composerState} />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="small"
            variant="secondary"
            title={t`Cancel`}
            onClick={goBackFromSidePanel}
          />,
          <Button
            key="send"
            size="small"
            variant="primary"
            accent="blue"
            title={t`Send`}
            Icon={IconSend}
            hotkeys={[getOsControlSymbol(), '⏎']}
            onClick={composerState.handleSend}
            disabled={!composerState.canSend}
          />,
        ]}
      />
    </StyledContainer>
  );
};
