import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import {
  type RecordPermissionsDto,
  type RecordPermissionsTargetInput,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

export const recordPermissionsFamilySelector = createAtomFamilySelector<
  RecordPermissionsDto | undefined,
  RecordPermissionsTargetInput
>({
  key: 'recordPermissionsFamilySelector',
  get:
    (target) =>
    ({ get }) => {
      const workspace = get(currentWorkspaceState);
      const member = get(currentWorkspaceMemberState);
      if (!isDefined(workspace) || !isDefined(member)) {
        return undefined;
      }
      const entry = get(recordPermissionsFamilyState, {
        objectMetadataId: target.objectMetadataId,
        recordId: target.recordId,
        workspaceId: workspace.id,
        workspaceMemberId: member.id,
      });
      return entry?.userWorkspace === get(currentUserWorkspaceState)
        ? entry?.permissions
        : undefined;
    },
});
