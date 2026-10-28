import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconHash, IconPlus } from 'twenty-ui/icon';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatChannelsNavigationSectionId';
import { useCreateAgentChatChannel } from '@/ai/hooks/useCreateAgentChatChannel';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelsSectionProps = {
  label?: string;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
  visibleItemLimit?: number | null;
};

export const NavigationDrawerAiChatChannelsSection = ({
  label,
  rightIcon,
  alwaysShowRightIcon,
  visibleItemLimit,
}: NavigationDrawerAiChatChannelsSectionProps = {}) => {
  const { t } = useLingui();
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const agentChatAccessibleChannels = useAtomStateValue(
    agentChatAccessibleChannelsSelector,
  );
  const agentChatChannelSummaries = useAtomStateValue(
    agentChatChannelSummariesState,
  );
  const { openNavigationSection } = useNavigationSection(
    AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID,
  );
  const { createAgentChatChannel } = useCreateAgentChatChannel();
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const [newChannelName, setNewChannelName] = useState<string | null>(null);

  // Listed only for who manages channels, so they keep a way to set them up
  const inaccessibleChannels = (agentChatChannels ?? []).filter(
    ({ isAccessible }) => !isAccessible,
  );
  const {
    visibleItems: visibleChannels,
    isOverVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems({
    navigationSectionId: AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID,
    items: [...agentChatAccessibleChannels, ...inaccessibleChannels],
    visibleItemLimit,
  });

  if (!isDefined(agentChatChannels)) {
    return null;
  }

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
      openAgentChatChannel({ channelId });
    }
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID}
      label={label ?? t`Channels`}
      alwaysShowRightIcon={
        alwaysShowRightIcon ?? agentChatAccessibleChannels.length === 0
      }
      rightIcon={
        rightIcon ??
        (canManageChannels ? (
          <LightIconButton
            emphasis="subtle"
            aria-label={t`New channel`}
            onClick={startCreate}
          >
            <IconPlus />
          </LightIconButton>
        ) : undefined)
      }
    >
      {visibleChannels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={
            channel.isAccessible
              ? agentChatChannelSummaries[channel.id]
              : undefined
          }
          destinationChannels={agentChatAccessibleChannels.filter(
            ({ id }) => id !== channel.id,
          )}
          canManage={canManageChannels}
        />
      ))}
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
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
