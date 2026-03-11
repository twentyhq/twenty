import { useOpenAskAIPageInSidePanel } from '@/side-panel/hooks/useOpenAskAIPageInSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit, IconSparkles } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIconButtonContainer = styled.div`
  color: ${themeCssVariables.font.color.secondary};
`;

export const SidePanelTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { openAskAIPage } = useOpenAskAIPageInSidePanel();
  const { switchToNewChat } = useCreateNewAIChatThread();

  if (isMobile || !isAiEnabled) {
    return null;
  }

  const isOnAskAIPage = [
    SidePanelPages.AskAI,
    SidePanelPages.ViewPreviousAIChats,
  ].includes(sidePanelPage);

  if (!isOnAskAIPage) {
    return (
      <StyledIconButtonContainer>
        <IconButton
          onClick={() => openAskAIPage({ resetNavigationStack: false })}
          Icon={IconSparkles}
          variant="tertiary"
          size="small"
        />
      </StyledIconButtonContainer>
    );
  }

  return (
    <StyledIconButtonContainer>
      <IconButton
        Icon={IconEdit}
        size="small"
        variant="tertiary"
        onClick={() => switchToNewChat()}
        ariaLabel={t`New conversation`}
      />
    </StyledIconButtonContainer>
  );
};
