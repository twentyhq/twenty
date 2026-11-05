import { type createStore } from 'jotai';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

const DEFAULT_THREAD_OBJECT_METADATA_ID = 'chat-object';

export const setAgentChatThreadPermissions = ({
  store,
  threadId,
  permissions,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  permissions: RecordPermissionsDto | undefined;
}) => {
  const workspace = store.get(currentWorkspaceState.atom) ?? {
    id: 'workspace',
  };
  const member = store.get(currentWorkspaceMemberState.atom) ?? {
    id: 'member',
  };
  store.set(currentWorkspaceState.atom, workspace as never);
  store.set(currentWorkspaceMemberState.atom, member as never);

  const objectMetadataStore = store.get(
    metadataStoreState.atomFamily('objectMetadataItems'),
  );
  const objectMetadataItems = store.get(flatObjectMetadataItemsSelector.atom);
  let objectMetadataId = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.universalIdentifier ===
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  )?.id;

  if (!isDefined(objectMetadataId)) {
    const existingObjectMetadataIds = new Set(
      objectMetadataItems.map((objectMetadataItem) => objectMetadataItem.id),
    );
    let objectMetadataIdSuffix = 0;
    objectMetadataId = DEFAULT_THREAD_OBJECT_METADATA_ID;

    while (existingObjectMetadataIds.has(objectMetadataId)) {
      objectMetadataIdSuffix += 1;
      objectMetadataId = `${DEFAULT_THREAD_OBJECT_METADATA_ID}-${objectMetadataIdSuffix}`;
    }

    store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
      ...objectMetadataStore,
      current: [
        ...objectMetadataStore.current,
        {
          id: objectMetadataId,
          universalIdentifier:
            STANDARD_OBJECTS.agentChatThread.universalIdentifier,
          nameSingular: 'agentChatThread',
          namePlural: 'agentChatThreads',
        },
      ],
      status:
        objectMetadataStore.status === 'empty'
          ? 'up-to-date'
          : objectMetadataStore.status,
    });
  }

  store.set(
    recordPermissionsFamilyState.atomFamily({
      objectMetadataId,
      recordId: threadId,
      workspaceId: workspace.id,
      workspaceMemberId: member.id,
    }),
    {
      requestId: 'test',
      permissions,
      userWorkspace: store.get(currentUserWorkspaceState.atom),
    },
  );
};
