import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Navigate } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatCollapseButton } from '@/ai/components/AiChatCollapseButton';
import { AiChatTab } from '@/ai/components/AiChatTab';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { ClearShouldOpenAiChatAfterOnboardingEffect } from '@/onboarding/components/ClearShouldOpenAiChatAfterOnboardingEffect';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { SIDE_PANEL_TOP_BAR_HEIGHT } from '@/side-panel/constants/SidePanelTopBarHeight';
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

const StyledHeader = styled.header`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${SIDE_PANEL_TOP_BAR_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledHeaderTitle = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: 24px;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
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

  if (!isOnboardingAiChatEnabled) {
    return <Navigate to={defaultHomePagePath} replace />;
  }

  return (
    <StyledPanel>
      <ClearShouldOpenAiChatAfterOnboardingEffect />
      <StyledHeader>
        <StyledHeaderTitle>{t`Onboarding`}</StyledHeaderTitle>
        <AiChatCollapseButton />
        <AiChatCloseButton />
      </StyledHeader>
      <StyledContent>
        <AiChatTab messageListPreamble={<WorkspaceSetupChatPreamble />} />
      </StyledContent>
    </StyledPanel>
  );
};
