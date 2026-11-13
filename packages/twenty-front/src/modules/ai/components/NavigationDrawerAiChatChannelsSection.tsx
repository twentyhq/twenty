import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconHash, IconPlus } from 'twenty-ui/icon';

import { NavigationDrawerInboxChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { useCreateInboxChannel } from '@/ai/hooks/useCreateAgentChatChannel';
import { useOpenInboxChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { inboxChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { inboxChannelsState } from '@/ai/states/agentChatChannelsState';
import { inboxAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const INBOX_CHANNELS_NAVIGATION_SECTION_ID = 'AiChatChannels';

export const NavigationDrawerInboxChannelsSection = () => {
  const { t } = useLingui();
  const inboxChannels = useAtomStateValue(inboxChannelsState);
  const inboxAccessibleChannels = useAtomStateValue(
    inboxAccessibleChannelsSelector,
  );
  const inboxChannelSummaries = useAtomStateValue(inboxChannelSummariesState);
  const { openNavigationSection } = useNavigationSection(
    INBOX_CHANNELS_NAVIGATION_SECTION_ID,
  );
  const { createAgentChatChannel } = useCreateInboxChannel();
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const { openInboxChannel } = useOpenInboxChannel();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const [newChannelName, setNewChannelName] = useState<string | null>(null);

  if (!isDefined(inboxChannels)) {
    return null;
  }

  // Listed only for who manages channels, so they keep a way to set them up
  const inaccessibleChannels = inboxChannels.filter(
    ({ isAccessible }) => !isAccessible,
  );

  const startCreate = () => {
    openNavigationSection();
    setNewChannelName('');
  };

  const commitCreate = async (name: string) => {
    setNewChannelName(null);

    const trimmedName = name.trim();

    if (!isNonEmptyString(trimmedName)) {
      return;
    }

    const channelId = await createAgentChatChannel(trimmedName);

    if (isDefined(channelId)) {
      openInboxChannel({ channelId });
    }
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_CHANNELS_NAVIGATION_SECTION_ID}
      label={t`Channels`}
      alwaysShowRightIcon={inboxAccessibleChannels.length === 0}
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
      {inboxAccessibleChannels.map((channel) => (
        <NavigationDrawerInboxChannelItem
          key={channel.id}
          channel={channel}
          summary={inboxChannelSummaries[channel.id]}
          destinationChannels={inboxAccessibleChannels.filter(
            ({ id }) => id !== channel.id,
          )}
          canManage={canManageChannels}
        />
      ))}
      {inaccessibleChannels.map((channel) => (
        <NavigationDrawerInboxChannelItem
          key={channel.id}
          channel={channel}
          summary={undefined}
          destinationChannels={inboxAccessibleChannels}
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
        canManageChannels &&
        isNavigationDrawerContentExpanded && (
          <NavigationDrawerItem
            label={t`Add channel`}
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
