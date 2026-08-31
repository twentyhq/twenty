import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { WorkspaceTargetArtifactHostContext } from '@/navigation/contexts/WorkspaceTargetArtifactHostContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsMobile } from 'twenty-ui/utilities';

const PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE = `calc(${themeCssVariables.border.radius.md} + ${themeCssVariables.spacing[1]})`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE} 0 0
    ${PANEL_CORNER_RADIUS_DERIVED_FROM_THEME_SCALE};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
`;

const StyledCenteredChatContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 auto;
  max-width: 768px;
  min-height: 0;
  width: 100%;
`;

export const AiChatPage = () => {
  const isMobile = useIsMobile();
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  const canHostWorkspaceTargetArtifacts =
    !isMobile && !shouldOpenAiChatAfterOnboarding;

  return (
    <StyledPanel>
      <AiChatPageThreadUrlSyncEffect />
      <AiChatPageCloseAskAiPanelEffect />
      <AiChatPageContinueInSidePanelEffect />
      {shouldOpenAiChatAfterOnboarding && <WorkspaceSetupChatKickoffEffect />}
      <AiChatPageHeader isOnboarding={shouldOpenAiChatAfterOnboarding} />
      <StyledCenteredChatContainer>
        <AiChatMessageListPreambleContext.Provider
          value={
            shouldOpenAiChatAfterOnboarding ? (
              <WorkspaceSetupChatPreamble />
            ) : null
          }
        >
          <WorkspaceTargetArtifactHostContext.Provider
            value={canHostWorkspaceTargetArtifacts}
          >
            <AiChatSurfaceContext.Provider value={AI_CHAT_SURFACE.PAGE}>
              <AiChatTab />
            </AiChatSurfaceContext.Provider>
          </WorkspaceTargetArtifactHostContext.Provider>
        </AiChatMessageListPreambleContext.Provider>
      </StyledCenteredChatContainer>
    </StyledPanel>
  );
};
