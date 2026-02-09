import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { IconEdit, IconSparkles } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';
import { FeatureFlagKey } from '~/generated/graphql';

import { useCreateNewAIChatThread } from '@/ai/hooks/useCreateNewAIChatThread';

const StyledIconButton = styled(IconButton)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const CommandMenuTopBarRightCornerIcon = () => {
  const isMobile = useIsMobile();
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();
  const { createChatThread } = useCreateNewAIChatThread();

  if (isMobile || !isAiEnabled) {
    return null;
  }

  const isOnAskAIPage = [
    CommandMenuPages.AskAI,
    CommandMenuPages.ViewPreviousAIChats,
  ].includes(commandMenuPage);

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

  return (
    <StyledIconButton
      Icon={IconEdit}
      size="small"
      variant="tertiary"
      onClick={() => createChatThread()}
      ariaLabel={t`New conversation`}
    />
  );
};
