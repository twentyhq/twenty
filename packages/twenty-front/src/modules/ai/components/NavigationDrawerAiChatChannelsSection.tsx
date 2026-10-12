import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconHash, IconPlus } from 'twenty-ui/icon';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { useAgentChatChannelActions } from '@/ai/hooks/useAgentChatChannelActions';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID = 'AiChatChannels';

export const NavigationDrawerAiChatChannelsSection = () => {
  const { t } = useLingui();
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const agentChatChannelSummaries = useAtomStateValue(
    agentChatChannelSummariesState,
  );
  const { openNavigationSection } = useNavigationSection(
    AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID,
  );
  const { createAgentChatChannel } = useAgentChatChannelActions();
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const [newChannelName, setNewChannelName] = useState<string | null>(null);

  if (!isDefined(agentChatChannels)) {
    return null;
  }

  const accessibleChannels = agentChatChannels.filter(
    ({ isAccessible }) => isAccessible,
  );
  // Listed only for who manages channels, so they keep a way to set them up
  const otherChannels = agentChatChannels.filter(
    ({ isAccessible }) => !isAccessible,
  );

  const startCreate = () => {
    openNavigationSection();
    setNewChannelName('');
  };

  const commitCreate = async (name: string) => {
    setNewChannelName(null);

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return;
    }

    const channelId = await createAgentChatChannel(trimmedName);

    if (isDefined(channelId)) {
      openAgentChatChannel(channelId);
    }
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID}
      label={t`Channels`}
      alwaysShowRightIcon={accessibleChannels.length === 0}
      rightIcon={
        canManageChannels ? (
          <LightIconButton
            emphasis="subtle"
            aria-label={t`New channel`}
            onClick={startCreate}
          >
            <IconPlus />
          </LightIconButton>
        ) : undefined
      }
    >
      {accessibleChannels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={agentChatChannelSummaries[channel.id]}
          destinationChannels={accessibleChannels.filter(
            ({ id }) => id !== channel.id,
          )}
          canManage={canManageChannels}
        />
      ))}
      {otherChannels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={undefined}
          destinationChannels={accessibleChannels}
          canManage={canManageChannels}
        />
      ))}
      {isDefined(newChannelName) ? (
        <NavigationDrawerInput
          Icon={IconHash}
          value={newChannelName}
          onChange={setNewChannelName}
          onSubmit={(name) => void commitCreate(name)}
          onCancel={() => setNewChannelName(null)}
          onClickOutside={(_event, name) => void commitCreate(name)}
          placeholder={t`Channel name`}
        />
      ) : (
        accessibleChannels.length === 0 &&
        canManageChannels && (
          <NavigationDrawerItem
            label={t`New channel`}
            Icon={IconPlus}
            variant="tertiary"
            onClick={startCreate}
            triggerEvent="CLICK"
          />
        )
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
