import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';

export const useRefreshAgentChatThreadPermissions = () => {
  const store = useStore();
  const { refreshRecordPermissions } = useRefreshRecordPermissions();
  const refreshAgentChatThreadPermissions = useCallback(
    async (threadIds: string[]) => {
      const objectMetadata = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: 'agentChatThread',
          objectNameType: 'singular',
        }),
      );
      if (!isDefined(objectMetadata)) {
        return;
      }
      await refreshRecordPermissions(
        threadIds.map((recordId) => ({
          objectMetadataId: objectMetadata.id,
          recordId,
        })),
      );
    },
    [store, refreshRecordPermissions],
  );
  return { refreshAgentChatThreadPermissions };
};
