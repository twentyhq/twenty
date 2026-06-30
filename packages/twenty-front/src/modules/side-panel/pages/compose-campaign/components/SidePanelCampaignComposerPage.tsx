import { CampaignComposerFields } from '@/activities/emails/components/CampaignComposerFields';
import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSend } from 'twenty-ui/icon';
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

export const SidePanelCampaignComposerPage = () => {
  const { goBackFromSidePanel } = useSidePanelHistory();

  const campaignState = useCampaignComposerState({
    onSent: goBackFromSidePanel,
  });

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: campaignState.handleSend,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [campaignState.handleSend],
  });

  return (
    <StyledContainer>
      <StyledContent>
        <CampaignComposerFields campaignState={campaignState} />
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
            title={t`Send campaign`}
            Icon={IconSend}
            hotkeys={[getOsControlSymbol(), '⏎']}
            onClick={campaignState.handleSend}
            disabled={!campaignState.canSend}
          />,
        ]}
      />
    </StyledContainer>
  );
};
