import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { aiChatAccessibleChannelsSelector } from '@/ai-chat/threads/states/selectors/aiChatAccessibleChannelsSelector';
import { sortAiChatThreadsByLastActivityDesc } from '@/ai-chat/threads/utils/sortAiChatThreadsByLastActivityDesc';
import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useOpenInboxChannel } from '@/inbox/hooks/useOpenInboxChannel';
import { useOpenInboxPresetFilter } from '@/inbox/hooks/useOpenInboxPresetFilter';
import { inboxFavoriteChannelsSelector } from '@/inbox/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { filterInboxRecentThreads } from '@/inbox/utils/filterInboxRecentThreads';
import { type NavigationMenuTabEntry } from '@/navigation-menu-item/common/types/NavigationMenuTabEntry';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuTabFirstEntry } from '@/navigation-menu-item/display/utils/getNavigationMenuTabFirstEntry';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { getSortedNonSystemAgents } from '@/object-core/agents/utils/getSortedNonSystemAgents';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  FindManyAgentsDocument,
} from '~/generated-metadata/graphql';

export const useOpenNavigationMenuTabFirstEntry = () => {
  const store = useStore();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const { workspaceNavigationMenuItemsSorted, navigationMenuItemsSorted } =
    useSortedNavigationMenuItems();
  const {
    workspaceNavigationMenuItemsByFolder,
    userNavigationMenuItemsByFolder,
  } = useNavigationMenuItemsByFolder();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const { isBuiltInSectionAvailable } =
    useNavigationMenuBuiltInSectionAvailability();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const { openInboxPresetFilter } = useOpenInboxPresetFilter(INBOX_INSTANCE_ID);
  const { openInboxChannel } = useOpenInboxChannel();
  const { handleThreadClick } = useAiChatThreadClick(
    isAiChatInboxEnabled
      ? { shouldOpenInFullPage: true }
      : { resetNavigationStack: true },
  );

  const getBuiltInSectionEntry = (
    builtInSectionKey: string,
  ): NavigationMenuTabEntry | null => {
    if (!isBuiltInSectionAvailable(builtInSectionKey)) {
      return null;
    }

    switch (builtInSectionKey) {
      case 'aiChatInbox':
        return {
          type: 'inboxPresetFilter',
          presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
        };
      case 'aiChatFavorites': {
        const [firstFavoriteChannel] = store.get(
          inboxFavoriteChannelsSelector.atom,
        );

        if (isDefined(firstFavoriteChannel)) {
          return { type: 'inboxChannel', channelId: firstFavoriteChannel.id };
        }

        const [firstFavoriteThread] = store.get(
          inboxFavoriteThreadsSelector.atom,
        );

        return isDefined(firstFavoriteThread)
          ? { type: 'aiChatThread', threadId: firstFavoriteThread.id }
          : null;
      }
      case 'aiChatChannels': {
        const [firstChannel] = store.get(aiChatAccessibleChannelsSelector.atom);

        return isDefined(firstChannel)
          ? { type: 'inboxChannel', channelId: firstChannel.id }
          : null;
      }
      case 'aiChatRecents': {
        const [firstRecentThread] = filterInboxRecentThreads({
          threads: sortAiChatThreadsByLastActivityDesc(
            store.get(
              inboxThreadListThreadsFamilySelector.selectorFamily(
                INBOX_RECENT_THREAD_LIST_SOURCE,
              ),
            ),
          ),
          favoriteThreads: store.get(inboxFavoriteThreadsSelector.atom),
          shouldExcludeDirectMessages: false,
        });

        return isDefined(firstRecentThread)
          ? { type: 'aiChatThread', threadId: firstRecentThread.id }
          : null;
      }
      case 'aiAgents': {
        const [firstAgent] = getSortedNonSystemAgents(
          apolloClient.readQuery({ query: FindManyAgentsDocument })
            ?.findManyAgents ?? [],
        );

        return isDefined(firstAgent)
          ? { type: 'link', link: getCoreAgentLink(firstAgent.id) }
          : null;
      }
      default:
        return null;
    }
  };

  const openNavigationMenuTabEntry = (
    entry: NavigationMenuTabEntry,
    { replace }: { replace: boolean },
  ) => {
    switch (entry.type) {
      case 'link':
        navigate(entry.link, { replace });
        return;
      case 'inboxPresetFilter':
        openInboxPresetFilter(entry.presetFilter);
        return;
      case 'inboxChannel':
        openInboxChannel({ channelId: entry.channelId });
        return;
      case 'aiChatThread':
        handleThreadClick({ id: entry.threadId });
        return;
    }
  };

  const openNavigationMenuTabFirstEntry = (
    tabId: string,
    { replace }: { replace: boolean },
  ) => {
    const firstEntry = getNavigationMenuTabFirstEntry({
      tabId,
      workspaceNavigationMenuItems,
      workspaceNavigationMenuItemsSorted,
      workspaceNavigationMenuItemsByFolder,
      favoriteNavigationMenuItems: navigationMenuItemsSorted.filter(
        (item) => !isDefined(item.parentId),
      ),
      favoriteNavigationMenuItemsByFolder: userNavigationMenuItemsByFolder,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
      permissionFlagMap,
      getBuiltInSectionEntry,
    });

    if (!isDefined(firstEntry)) {
      return false;
    }

    openNavigationMenuTabEntry(firstEntry, { replace });

    return true;
  };

  return { openNavigationMenuTabFirstEntry };
};
