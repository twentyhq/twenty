import { isObject } from '@sniptt/guards';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const agentChatThreadPermissionsFamilySelector =
  createAtomFamilySelector<RecordPermissionsDto | undefined, string>({
    key: 'agentChatThreadPermissionsFamilySelector',
    get:
      (threadId) =>
      ({ get }) => {
        const metadataStore = get(metadataStoreState, 'agentChatThreads');
        const thread = metadataStore.current.find(
          (entry) => 'id' in entry && entry.id === threadId,
        );
        const permissions =
          isDefined(thread) && 'permissions' in thread
            ? thread.permissions
            : undefined;
        if (!isObject(permissions)) {
          return undefined;
        }
        return {
          canRead: 'canRead' in permissions && permissions.canRead === true,
          canUpdate:
            'canUpdate' in permissions && permissions.canUpdate === true,
          canDelete:
            'canDelete' in permissions && permissions.canDelete === true,
          canSoftDelete:
            'canSoftDelete' in permissions &&
            permissions.canSoftDelete === true,
        };
      },
  });
