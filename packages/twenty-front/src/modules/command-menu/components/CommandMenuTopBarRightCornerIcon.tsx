import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconSparkles } from 'twenty-ui/display';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledIconContainer = styled.div<{ iconColor?: string }>`
  align-items: center;
  color: ${({ iconColor, theme }) => iconColor ?? theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  justify-content: center;
`;

const StyledIconSparkles = styled(IconSparkles)`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
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

  const theme = useTheme();

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
      <StyledIconSparkles
        onClick={() => openAskAIPage({ resetNavigationStack: false })}
        size={theme.icon.size.md}
      />
    );
  }

  if (!canGoBack) {
    return null;
  }

  const previousPageItem = commandMenuNavigationStack.at(-2);
  const PreviousPageIcon = previousPageItem?.pageIcon;
  const previousPageIconColor = previousPageItem?.pageIconColor;

  if (!isDefined(PreviousPageIcon)) {
    return null;
  }

  return (
    <StyledIconContainer
      iconColor={previousPageIconColor}
      onClick={goBackFromCommandMenu}
    >
      <PreviousPageIcon size={theme.icon.size.md} />
    </StyledIconContainer>
  );
};
