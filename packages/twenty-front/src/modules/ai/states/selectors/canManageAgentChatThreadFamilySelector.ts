import { isDefined } from 'twenty-shared/utils';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const canManageAgentChatThreadFamilySelector = createAtomFamilySelector<
  boolean,
  string
>({
  key: 'canManageAgentChatThreadFamilySelector',
  get:
    (threadId) =>
    ({ get }) => {
      const metadataStore = get(metadataStoreState, 'agentChatThreads');
      const thread = metadataStore.current.find(
        (entry) => 'id' in entry && entry.id === threadId,
      );
      return (
        isDefined(thread) && 'canManage' in thread && thread.canManage === true
      );
    },
});
