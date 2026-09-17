import { useLingui } from '@lingui/react/macro';

import { AiChatChannelMenu } from '@/ai/components/AiChatChannelMenu';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import {
  AgentChatChannelVisibility,
  type AgentChatThread,
} from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelSectionProps = {
  channel: FlatAgentChatChannel;
  threads: AgentChatThread[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThread) => void;
};

export const NavigationDrawerAiChatChannelSection = ({
  channel,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerAiChatChannelSectionProps) => {
  const { t } = useLingui();
  const label =
    channel.visibility === AgentChatChannelVisibility.PRIVATE
      ? `🔒 ${channel.name}`
      : `# ${channel.name}`;

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={`AiChatChannel:${channel.id}`}
      label={label}
      rightIcon={<AiChatChannelMenu channel={channel} />}
    >
      {threads.length === 0 ? (
        <NavigationDrawerItem label={t`No chat yet`} variant="placeholder" />
      ) : (
        threads.map((thread) => (
          <NavigationDrawerAiChatThreadItem
            key={thread.id}
            thread={thread}
            isActive={currentThreadId === thread.id}
            onClick={onThreadClick}
          />
        ))
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
