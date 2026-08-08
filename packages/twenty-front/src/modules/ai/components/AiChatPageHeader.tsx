import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconEdit, IconHistory, IconSparkles } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';

import { AiChatCollapseButton } from '@/ai/components/AiChatCollapseButton';
import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';

export const AiChatPageHeader = () => {
  const { t } = useLingui();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const { switchToNewChat } = useSwitchToNewAiChat();

  const handleOpenPreviousChats = () => {
    navigateSidePanelMenu({
      page: SidePanelPages.ViewPreviousAiChats,
      pageTitle: t`View Previous AI Chats`,
      pageIcon: IconHistory,
      pageId: v4(),
      resetNavigationStack: true,
    });
  };

  return (
    <PageHeader title={t`Ask AI`} Icon={IconSparkles}>
      <IconButton
        Icon={IconHistory}
        size="small"
        variant="tertiary"
        onClick={handleOpenPreviousChats}
        ariaLabel={t`View Previous AI Chats`}
      />
      <IconButton
        Icon={IconEdit}
        size="small"
        variant="tertiary"
        onClick={() => switchToNewChat()}
        ariaLabel={t`New conversation`}
      />
      <AiChatCollapseButton />
    </PageHeader>
  );
};
