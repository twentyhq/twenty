import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadClick } from '@/ai-chat/threads/hooks/useAiChatThreadClick';
import { aiChatAccessibleChannelsSelector } from '@/ai-chat/threads/states/selectors/aiChatAccessibleChannelsSelector';
import { INBOX_INSTANCE_ID } from '@/inbox/constants/InboxInstanceId';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useOpenInboxChannel } from '@/inbox/hooks/useOpenInboxChannel';
import { useOpenInboxPresetFilter } from '@/inbox/hooks/useOpenInboxPresetFilter';
import { inboxFavoriteChannelsSelector } from '@/inbox/states/selectors/inboxFavoriteChannelsSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { type NavigationMenuTabEntry } from '@/navigation-menu-item/common/types/NavigationMenuTabEntry';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useNavigationMenuBuiltInSectionAvailability } from '@/navigation-menu-item/display/hooks/useNavigationMenuBuiltInSectionAvailability';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuBuiltInSectionEntry } from '@/navigation-menu-item/display/utils/getNavigationMenuBuiltInSectionEntry';
import { getNavigationMenuTabFirstEntry } from '@/navigation-menu-item/display/utils/getNavigationMenuTabFirstEntry';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
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
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
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

  const openNavigationMenuTabEntry = ({
    entry,
    shouldReplace,
  }: {
    entry: NavigationMenuTabEntry;
    shouldReplace: boolean;
  }) => {
    switch (entry.type) {
      case 'link':
        navigate(entry.link, { replace: shouldReplace });
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

  const openNavigationMenuTabFirstEntry = ({
    tabId,
    shouldReplace,
  }: {
    tabId: string;
    shouldReplace: boolean;
  }) => {
    const builtInSectionData = {
      favoriteChannels: store.get(inboxFavoriteChannelsSelector.atom),
      favoriteThreads: store.get(inboxFavoriteThreadsSelector.atom),
      accessibleChannels: store.get(aiChatAccessibleChannelsSelector.atom),
      recentThreads: store.get(
        inboxThreadListThreadsFamilySelector.selectorFamily(
          INBOX_RECENT_THREAD_LIST_SOURCE,
        ),
      ),
      agents:
        apolloClient.readQuery({ query: FindManyAgentsDocument })
          ?.findManyAgents ?? [],
    };

    const firstEntry = getNavigationMenuTabFirstEntry({
      tabId,
      workspaceNavigationMenuItems,
      workspaceNavigationMenuItemsSorted,
      workspaceNavigationMenuItemsByFolder,
      favoriteNavigationMenuItems: navigationMenuItemsSorted.filter(
        (item) => !isDefined(item.parentId),
      ),
      favoriteNavigationMenuItemsByFolder: userNavigationMenuItemsByFolder,
      objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
      views: store.get(viewsSelector.atom),
      objectPermissionsByObjectMetadataId,
      permissionFlagMap: store.get(permissionFlagMapSelector.atom),
      getBuiltInSectionEntry: (builtInSectionKey) =>
        isBuiltInSectionAvailable(builtInSectionKey)
          ? getNavigationMenuBuiltInSectionEntry({
              builtInSectionKey,
              ...builtInSectionData,
            })
          : null,
    });

    if (!isDefined(firstEntry)) {
      return false;
    }

    openNavigationMenuTabEntry({ entry: firstEntry, shouldReplace });

    return true;
  };

  return { openNavigationMenuTabFirstEntry };
};
