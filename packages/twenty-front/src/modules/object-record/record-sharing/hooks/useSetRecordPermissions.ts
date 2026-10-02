import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import {
  type RecordPermissionsDto,
  type RecordTargetInput,
} from '~/generated-metadata/graphql';

export const useSetRecordPermissions = () => {
  const store = useStore();
  const setRecordPermissions = useCallback(
    (target: RecordTargetInput, permissions: RecordPermissionsDto) => {
      const workspace = store.get(currentWorkspaceState.atom);
      const member = store.get(currentWorkspaceMemberState.atom);
      if (!isDefined(workspace) || !isDefined(member)) {
        return;
      }
      // A fresh request id makes any refresh still in flight drop its older answer
      store.set(
        recordPermissionsFamilyState.atomFamily({
          objectMetadataId: target.objectMetadataId,
          recordId: target.recordId,
          workspaceId: workspace.id,
          workspaceMemberId: member.id,
        }),
        {
          requestId: v4(),
          userWorkspace: store.get(currentUserWorkspaceState.atom),
          permissions,
        },
      );
    },
    [store],
  );
  return { setRecordPermissions };
};
