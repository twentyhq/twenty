import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { useCanSyncInbox } from '@/inbox/hooks/useCanSyncInbox';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useInboxThreadSyncStatus = () => {
  const canSyncInbox = useCanSyncInbox();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const chatObjectPermissions = useObjectPermissionsForObject(
    chatObjectMetadataItem?.id ?? '',
  );

  const isThreadSyncEnabled = isDefined(chatObjectMetadataItem);
  const canLoadChatThreads =
    canSyncInbox &&
    isThreadSyncEnabled &&
    isNonEmptyArray(chatObjectMetadataItem.readableFields) &&
    canAccessThroughAllRecordsOrRlsPermission({
      objectRecordsPermissions: chatObjectPermissions,
      operationType: 'read',
    });

  return {
    chatObjectMetadataItemId: chatObjectMetadataItem?.id,
    isThreadSyncEnabled,
    canLoadChatThreads,
  };
};
