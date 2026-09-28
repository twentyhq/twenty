import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

// Filing a conversation under a record takes the access renaming it does, so a
// conversation the member can only read would be refused by the server.
export const agentChatEditableThreadsSelector = createAtomSelector<
  FlatAgentChatThread[]
>({
  key: 'agentChatEditableThreadsSelector',
  get: ({ get }) => {
    const storeItem = get(metadataStoreState, 'agentChatThreads');
    const allThreads = storeItem.current as FlatAgentChatThread[];

    return sortChatThreadsByLastActivityDesc(
      allThreads.filter(
        (thread) =>
          !isDefined(thread.deletedAt) &&
          get(agentChatThreadPermissionsFamilySelector, thread.id)
            ?.canUpdate === true,
      ),
    );
  },
});
