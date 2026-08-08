import { styled } from '@linaria/react';
import { Navigate } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatPageCloseAskAiPanelEffect } from '@/ai/components/AiChatPageCloseAskAiPanelEffect';
import { AiChatPageContinueInSidePanelEffect } from '@/ai/components/AiChatPageContinueInSidePanelEffect';
import { AiChatPageHeader } from '@/ai/components/AiChatPageHeader';
import { AiChatPageThreadUrlSyncEffect } from '@/ai/components/AiChatPageThreadUrlSyncEffect';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isAiChatPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_PAGE_ENABLED,
  );
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  // Onboarding lands here regardless of the feature flag: the page is the
  // onboarding chat's host since the standalone workspace-setup page was
  // removed.
  if (!isAiChatPageEnabled && !shouldOpenAiChatAfterOnboarding) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

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
          <AiChatTab />
        </AiChatMessageListPreambleContext.Provider>
      </StyledCenteredChatContainer>
    </StyledPanel>
  );
};
