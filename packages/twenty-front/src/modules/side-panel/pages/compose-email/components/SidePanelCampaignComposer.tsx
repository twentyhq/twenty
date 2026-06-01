import { EmailCampaignComposerFields } from '@/activities/emails/components/EmailCampaignComposerFields';
import { useEmailCampaignComposerState } from '@/activities/emails/hooks/useEmailCampaignComposerState';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { ComposeEmailFooter } from '@/side-panel/pages/compose-email/components/ComposeEmailFooter';
import { composeEmailDefaultSubjectComponentState } from '@/side-panel/pages/compose-email/states/composeEmailDefaultSubjectComponentState';
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

export const SidePanelCampaignComposer = () => {
  const composeEmailDefaultSubject = useAtomComponentStateValue(
    composeEmailDefaultSubjectComponentState,
  );

  const { goBackFromSidePanel } = useSidePanelHistory();

  const campaignState = useEmailCampaignComposerState({
    defaultSubject: composeEmailDefaultSubject ?? '',
    onSent: goBackFromSidePanel,
  });

  return (
    <StyledComposerLayout>
      <StyledComposerScrollableContent>
        <EmailCampaignComposerFields campaignState={campaignState} />
      </StyledComposerScrollableContent>
      <ComposeEmailFooter
        sendLabel={t`Send campaign`}
        canSend={campaignState.canSend}
        onSend={campaignState.handleSend}
        onCancel={goBackFromSidePanel}
      />
    </StyledComposerLayout>
  );
};
