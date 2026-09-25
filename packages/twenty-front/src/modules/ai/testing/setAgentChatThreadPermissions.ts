import { type createStore } from 'jotai';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

export const setAgentChatThreadPermissions = (
  store: ReturnType<typeof createStore>,
  threadId: string,
  permissions: RecordPermissionsDto | undefined,
) => {
  const workspace = store.get(currentWorkspaceState.atom) ?? {
    id: 'workspace',
  };
  const member = store.get(currentWorkspaceMemberState.atom) ?? {
    id: 'member',
  };
  store.set(currentWorkspaceState.atom, workspace as never);
  store.set(currentWorkspaceMemberState.atom, member as never);
  store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
    current: [{ id: 'chat-object', nameSingular: 'agentChatThread' }],
    draft: [],
    status: 'up-to-date',
  });
  store.set(
    recordPermissionsFamilyState.atomFamily({
      objectMetadataId: 'chat-object',
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
