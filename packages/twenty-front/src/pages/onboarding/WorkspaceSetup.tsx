import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { WorkspaceSetupHeader } from '@/onboarding/components/WorkspaceSetupHeader';
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

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow-x: clip;
  width: 100%;
`;

export const WorkspaceSetup = () => {
  const { t } = useLingui();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isOnboardingAiChatEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ONBOARDING_AI_CHAT_ENABLED,
  );
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  if (!isOnboardingAiChatEnabled) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  const title = shouldOpenAiChatAfterOnboarding ? t`Onboarding` : t`Ask AI`;
  const preamble = shouldOpenAiChatAfterOnboarding ? (
    <WorkspaceSetupChatPreamble />
  ) : null;

  return (
    <StyledPanel>
      <WorkspaceSetupHeader title={title} />
      <StyledContent>
        <AiChatMessageListPreambleContext.Provider value={preamble}>
          <AiChatTab />
        </AiChatMessageListPreambleContext.Provider>
      </StyledContent>
    </StyledPanel>
  );
};
