import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconHash, IconPlus } from 'twenty-ui/icon';

import { INBOX_CHANNELS_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxChannelsNavigationSectionId';
import { NavigationDrawerInboxChannelItem } from '@/inbox/components/NavigationDrawerInboxChannelItem';
import { useCreateInboxChannel } from '@/inbox/hooks/useCreateInboxChannel';
import { useOpenInboxChannel } from '@/inbox/hooks/useOpenInboxChannel';
import { inboxChannelSummariesState } from '@/inbox/states/inboxChannelSummariesState';
import { aiChatChannelsState } from '@/ai-chat/threads/states/aiChatChannelsState';
import { aiChatAccessibleChannelsSelector } from '@/ai-chat/threads/states/selectors/aiChatAccessibleChannelsSelector';
import { NavigationMenuSectionSeeMore } from '@/navigation-menu-item/display/sections/components/NavigationMenuSectionSeeMore';
import { StyledNavigationMenuSectionHiddenItems } from '@/navigation-menu-item/display/sections/components/StyledNavigationMenuSectionHiddenItems';
import { getNavigationSectionVisibleItems } from '@/navigation-menu-item/display/utils/getNavigationSectionVisibleItems';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

type NavigationDrawerInboxChannelsSectionProps = {
  visibleItemLimit?: number | null;
  headerAction?: ReactNode;
};

export const NavigationDrawerInboxChannelsSection = ({
  visibleItemLimit,
  headerAction,
}: NavigationDrawerInboxChannelsSectionProps) => {
  const { t } = useLingui();
  const aiChatChannels = useAtomStateValue(aiChatChannelsState);
  const aiChatAccessibleChannels = useAtomStateValue(
    aiChatAccessibleChannelsSelector,
  );
  const inboxChannelSummaries = useAtomStateValue(inboxChannelSummariesState);
  const { openNavigationSection } = useNavigationSection(
    INBOX_CHANNELS_NAVIGATION_SECTION_ID,
  );
  const { createInboxChannel } = useCreateInboxChannel();
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const { openInboxChannel } = useOpenInboxChannel();
  const [newChannelName, setNewChannelName] = useState<string | null>(null);
  const inaccessibleChannels = (aiChatChannels ?? []).filter(
    ({ isAccessible }) => !isAccessible,
  );
  const {
    visibleItems: visibleChannels,
    hiddenItems: hiddenChannels,
    hasHiddenItems,
  } = getNavigationSectionVisibleItems({
    items: [
      ...aiChatAccessibleChannels.map((channel) => ({
        channel,
        isAccessible: true,
      })),
      ...inaccessibleChannels.map((channel) => ({
        channel,
        isAccessible: false,
      })),
    ],
    visibleItemLimit,
  });

  if (!isDefined(aiChatChannels) && !isDefined(headerAction)) {
    return null;
  }

  const renderChannel = ({
    channel,
    isAccessible,
  }: (typeof visibleChannels)[number]) => (
    <NavigationDrawerInboxChannelItem
      key={channel.id}
      channel={channel}
      summary={isAccessible ? inboxChannelSummaries[channel.id] : undefined}
      destinationChannels={
        isAccessible
          ? aiChatAccessibleChannels.filter(({ id }) => id !== channel.id)
          : aiChatAccessibleChannels
      }
      canManage={canManageChannels}
    />
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

    const channelId = await createInboxChannel(trimmedName);

    if (isDefined(channelId)) {
      openInboxChannel({ channelId });
    }
  };

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={INBOX_CHANNELS_NAVIGATION_SECTION_ID}
      label={t`Channels`}
      alwaysShowRightIcon={
        isDefined(headerAction) || aiChatAccessibleChannels.length === 0
      }
      rightIcon={
        headerAction ??
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
      {visibleChannels.map(renderChannel)}
      {hasHiddenItems && (
        <NavigationMenuSectionSeeMore
          sectionId={INBOX_CHANNELS_NAVIGATION_SECTION_ID}
          hiddenItems={
            <StyledNavigationMenuSectionHiddenItems>
              {hiddenChannels.map(renderChannel)}
            </StyledNavigationMenuSectionHiddenItems>
          }
        />
      )}
      {isDefined(newChannelName) && (
        <NavigationDrawerInput
          Icon={IconHash}
          value={newChannelName}
          onChange={setNewChannelName}
          onSubmit={(name) => void commitCreate(name)}
          onCancel={() => setNewChannelName(null)}
          onClickOutside={(_event, name) => void commitCreate(name)}
          placeholder={t`Channel name`}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
