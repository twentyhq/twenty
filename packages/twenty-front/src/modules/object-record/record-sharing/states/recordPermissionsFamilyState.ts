import { type CurrentUserWorkspace } from '@/auth/states/currentUserWorkspaceState';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import {
  type RecordPermissionsDto,
  type RecordTargetInput,
} from '~/generated-metadata/graphql';

export const recordPermissionsFamilyState = createAtomFamilyState<
  | {
      requestId: string;
      permissions?: RecordPermissionsDto;
      userWorkspace: CurrentUserWorkspace | null;
    }
  | undefined,
  RecordTargetInput & {
    workspaceId: string;
    workspaceMemberId: string;
  }
>({
  key: 'recordPermissionsFamilyState',
  defaultValue: undefined,
});
