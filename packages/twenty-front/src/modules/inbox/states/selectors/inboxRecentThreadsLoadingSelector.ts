import { isDefined } from 'twenty-shared/utils';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { PermissionFlagType } from '~/generated-metadata/graphql';

// The record API refuses a suspended workspace, so its chats never load
export const inboxRecentThreadsLoadingSelector = createAtomSelector<boolean>({
  key: 'inboxRecentThreadsLoadingSelector',
  get: ({ get }) =>
    !isDefined(
      get(
        inboxThreadListFamilyState,
        getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
      ),
    ) &&
    get(permissionFlagMapSelector)[PermissionFlagType.AI] &&
    get(currentWorkspaceState)?.activationStatus !==
      WorkspaceActivationStatus.SUSPENDED,
});
