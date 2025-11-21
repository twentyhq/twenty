import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconHandMove, IconSparkles } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledIconButton = styled(IconButton)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const CommandMenuTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const commandMenuNavigationStack = useRecoilValue(
    commandMenuNavigationStackState,
  );

  const { goBackFromCommandMenu } = useCommandMenuHistory();
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  if (isMobile || !isAiEnabled) {
    return null;
  }

  const isOnAskAIPage = [
    CommandMenuPages.AskAI,
    CommandMenuPages.ViewPreviousAIChats,
  ].includes(commandMenuPage);

  const canGoBack = commandMenuNavigationStack.length > 1;

  if (!isOnAskAIPage) {
    return (
      <StyledIconButton
        onClick={() => openAskAIPage({ resetNavigationStack: false })}
        Icon={IconSparkles}
        variant="tertiary"
        size="small"
      />
    );
  }

  if (!canGoBack) {
    return null;
  }

  return (
    <StyledIconButton
      Icon={IconHandMove}
      size="small"
      variant="tertiary"
      onClick={goBackFromCommandMenu}
    />
  );
};
