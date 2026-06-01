import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { useEmailComposerState } from '@/activities/emails/hooks/useEmailComposerState';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { ComposeEmailFooter } from '@/side-panel/pages/compose-email/components/ComposeEmailFooter';
import { composeEmailDefaultInReplyToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultInReplyToComponentState';
import { composeEmailDefaultSubjectComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultSubjectComponentState';
import { composeEmailDefaultToComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultToComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

const StyledComposerLayout = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledComposerScrollableContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

type SidePanelTransactionalComposerProps = {
  connectedAccountId: string;
};

export const SidePanelTransactionalComposer = ({
  connectedAccountId,
}: SidePanelTransactionalComposerProps) => {
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
    connectedAccountId,
    defaultTo: composeEmailDefaultTo ?? '',
    defaultSubject: composeEmailDefaultSubject ?? '',
    defaultInReplyTo: composeEmailDefaultInReplyTo ?? undefined,
    onSent: goBackFromSidePanel,
  });

  return (
    <StyledComposerLayout>
      <StyledComposerScrollableContent>
        <EmailComposerFields composerState={composerState} />
      </StyledComposerScrollableContent>
      <ComposeEmailFooter
        sendLabel={t`Send`}
        canSend={composerState.canSend}
        onSend={composerState.handleSend}
        onCancel={goBackFromSidePanel}
      />
    </StyledComposerLayout>
  );
};
