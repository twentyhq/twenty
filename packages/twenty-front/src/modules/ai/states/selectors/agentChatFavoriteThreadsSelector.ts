import {
  StandardObjectNameSingular,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const agentChatFavoriteThreadsSelector = createAtomSelector<
  AgentChatThreadListItem[]
>({
  key: 'agentChatFavoriteThreadsSelector',
  get: ({ get }) => {
    const chatObjectMetadataItem = get(objectMetadataItemFamilySelector, {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    });

    if (!isDefined(chatObjectMetadataItem)) {
      return [];
    }

    return get(navigationMenuItemsSelector)
      .filter(
        (item) =>
          isDefined(item.userWorkspaceId) &&
          item.type === NavigationMenuItemType.RECORD &&
          item.targetObjectMetadataId === chatObjectMetadataItem.id,
      )
      .sort((a, b) => a.position - b.position)
      .flatMap((item) => {
        if (
          !isDefined(item.targetRecordId) ||
          !isDefined(item.targetRecordIdentifier)
        ) {
          return [];
        }

        // The loaded chat carries its latest title and deletion, which the favorite's identifier doesn't follow.
        const loadedThread = get(
          agentChatThreadRecordFamilySelector,
          item.targetRecordId,
        );

        return [
          isDefined(loadedThread)
            ? {
                id: loadedThread.id,
                title: loadedThread.title,
                conversationType: loadedThread.conversationType,
                directMessageFirstWorkspaceMemberId:
                  loadedThread.directMessageFirstWorkspaceMemberId,
                directMessageSecondWorkspaceMemberId:
                  loadedThread.directMessageSecondWorkspaceMemberId,
                deletedAt: loadedThread.deletedAt,
              }
            : {
                id: item.targetRecordId,
                title: item.targetRecordIdentifier.labelIdentifier,
                deletedAt: null,
              },
        ];
      })
      .filter((thread) => !isDefined(thread.deletedAt));
  },
});
