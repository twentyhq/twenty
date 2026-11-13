import { useStore } from 'jotai';
import { useCallback } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useRefreshRecordPermissions } from '@/object-record/record-sharing/hooks/useRefreshRecordPermissions';

export const useRefreshInboxThreadPermissions = () => {
  const store = useStore();
  const { refreshRecordPermissions } = useRefreshRecordPermissions();
  const refreshInboxThreadPermissions = useCallback(
    async (threadIds: string[]) => {
      const objectMetadata = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: StandardObjectNameSingular.AgentChatThread,
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
  return { refreshInboxThreadPermissions };
};
