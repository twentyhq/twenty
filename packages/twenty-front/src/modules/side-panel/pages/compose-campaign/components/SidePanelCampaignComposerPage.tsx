import { useCallback } from 'react';

import { CampaignComposerFields } from '@/activities/emails/components/CampaignComposerFields';
import { useCampaignComposerState } from '@/activities/emails/hooks/useCampaignComposerState';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSend } from 'twenty-ui-deprecated/display';
import { Button } from 'twenty-ui-deprecated/input';
import { getOsControlSymbol } from 'twenty-ui-deprecated/utilities';

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

  const handleSendHotkey = useCallback(() => {
    if (campaignState.canSend) {
      campaignState.handleSend();
    }
  }, [campaignState]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSendHotkey,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSendHotkey],
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
