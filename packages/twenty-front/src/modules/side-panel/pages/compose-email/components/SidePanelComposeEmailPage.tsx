import { useState } from 'react';

import { composeEmailConnectedAccountIdComponentState } from '@/side-panel/pages/compose-email/states/composeEmailConnectedAccountIdComponentState';
import {
  type ComposeEmailMode,
  ComposeEmailModeTabs,
} from '@/side-panel/pages/compose-email/components/ComposeEmailModeTabs';
import { SidePanelCampaignComposer } from '@/side-panel/pages/compose-email/components/SidePanelCampaignComposer';
import { SidePanelTransactionalComposer } from '@/side-panel/pages/compose-email/components/SidePanelTransactionalComposer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SidePanelComposeEmailPage = () => {
  const composeEmailConnectedAccountId = useAtomComponentStateValue(
    composeEmailConnectedAccountIdComponentState,
  );

  const [mode, setMode] = useState<ComposeEmailMode>('TRANSACTIONAL');

  if (!composeEmailConnectedAccountId) {
    return null;
  }

  return (
    <StyledContainer>
      <ComposeEmailModeTabs activeMode={mode} onModeChange={setMode} />
      {mode === 'CAMPAIGN' ? (
        <SidePanelCampaignComposer />
      ) : (
        <SidePanelTransactionalComposer
          connectedAccountId={composeEmailConnectedAccountId}
        />
      )}
    </StyledContainer>
  );
};
