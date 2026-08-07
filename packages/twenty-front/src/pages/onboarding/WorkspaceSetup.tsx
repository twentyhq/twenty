import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { ExpandedAiChatHeader } from '@/ai/expanded-chat/components/ExpandedAiChatHeader';
import { ExpandedAiChatSidePanelHandoffEffect } from '@/ai/expanded-chat/effect-components/ExpandedAiChatSidePanelHandoffEffect';
import { currentUserState } from '@/auth/states/currentUserState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { WorkspaceSetupChatKickoffEffect } from '@/onboarding/effect-components/WorkspaceSetupChatKickoffEffect';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  const currentUser = useAtomStateValue(currentUserState);
  const isOnboardingAiChatEnabled = useAtomStateValue(
    isOnboardingAiChatEnabledState,
  );
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );

  if (!isOnboardingAiChatEnabled || currentUser?.isWorkspaceCreator !== true) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  const title = shouldOpenAiChatAfterOnboarding ? t`Onboarding` : t`Ask AI`;
  const preamble = shouldOpenAiChatAfterOnboarding ? (
    <WorkspaceSetupChatPreamble />
  ) : null;

  return (
    <StyledPanel>
      <ExpandedAiChatHeader title={title} />
      <StyledContent>
        <ExpandedAiChatSidePanelHandoffEffect />
        {shouldOpenAiChatAfterOnboarding && <WorkspaceSetupChatKickoffEffect />}
        <AiChatMessageListPreambleContext.Provider value={preamble}>
          <AiChatTab />
        </AiChatMessageListPreambleContext.Provider>
      </StyledContent>
    </StyledPanel>
  );
};
