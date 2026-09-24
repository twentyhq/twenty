import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import {
  GetRecordPermissionsDocument,
  type RecordPermissionsTargetInput,
} from '~/generated-metadata/graphql';

const PERMISSION_BATCH_SIZE = 100;

export const useRefreshRecordPermissions = () => {
  const client = useApolloClient();
  const store = useStore();
  const refreshRecordPermissions = useCallback(
    async (targets: RecordPermissionsTargetInput[]) => {
      const workspace = store.get(currentWorkspaceState.atom);
      const member = store.get(currentWorkspaceMemberState.atom);
      const userWorkspace = store.get(currentUserWorkspaceState.atom);
      if (!isDefined(workspace) || !isDefined(member)) {
        return;
      }
      const uniqueTargets = [
        ...new Map(
          targets.map((target) => [
            `${target.objectMetadataId}:${target.recordId}`,
            target,
          ]),
        ).values(),
      ];
      const requestId = v4();
      const targetAtom = (target: RecordPermissionsTargetInput) =>
        recordPermissionsFamilyState.atomFamily({
          objectMetadataId: target.objectMetadataId,
          recordId: target.recordId,
          workspaceId: workspace.id,
          workspaceMemberId: member.id,
        });
      for (const target of uniqueTargets) {
        store.set(targetAtom(target), { requestId, userWorkspace });
      }
      for (
        let offset = 0;
        offset < uniqueTargets.length;
        offset += PERMISSION_BATCH_SIZE
      ) {
        const batch = uniqueTargets.slice(
          offset,
          offset + PERMISSION_BATCH_SIZE,
        );
        const result = await client
          .query({
            query: GetRecordPermissionsDocument,
            variables: { targets: batch },
            fetchPolicy: 'no-cache',
          })
          .catch(() => undefined);
        if (
          store.get(currentWorkspaceState.atom)?.id !== workspace.id ||
          store.get(currentWorkspaceMemberState.atom)?.id !== member.id ||
          store.get(currentUserWorkspaceState.atom) !== userWorkspace
        ) {
          return;
        }
        for (const target of batch) {
          if (store.get(targetAtom(target))?.requestId !== requestId) {
            continue;
          }
          const permissions = result?.data?.recordPermissions.find(
            (entry) =>
              entry.objectMetadataId === target.objectMetadataId &&
              entry.recordId === target.recordId,
          )?.permissions;
          store.set(targetAtom(target), {
            requestId,
            userWorkspace,
            permissions,
          });
        }
      }
    },
    [client, store],
  );
  return { refreshRecordPermissions };
};
