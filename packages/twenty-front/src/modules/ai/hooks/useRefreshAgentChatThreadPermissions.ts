import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';

export const useRefreshAgentChatThreadPermissions = () => {
  const store = useStore();
  const { refreshRecordPermissions } = useRefreshRecordPermissions();
  const refreshAgentChatThreadPermissions = useCallback(
    async (threadIds: string[]) => {
      const objectMetadata = store.get(
        objectMetadataItemByUniversalIdentifierFamilySelector.selectorFamily(
          STANDARD_OBJECTS.agentChatThread.universalIdentifier,
        ),
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
