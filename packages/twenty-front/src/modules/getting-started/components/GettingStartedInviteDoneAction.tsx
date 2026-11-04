import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { GettingStartedDoneCard } from '@/getting-started/components/GettingStartedDoneCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUsers } from 'twenty-ui/icon';
import { GetWorkspaceInvitationsDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const GettingStartedInviteDoneAction = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { data } = useQuery(GetWorkspaceInvitationsDocument);

  if (!isDefined(data)) {
    return null;
  }

  const pendingCount = data.findWorkspaceInvitations.length;
  const joinedCount = Math.max(currentWorkspaceMembers.length - 1, 0);
  const invitedCount = joinedCount + pendingCount;

  return (
    <GettingStartedDoneCard
      Icon={IconUsers}
      title={plural(invitedCount, {
        one: '# teammate invited',
        other: '# teammates invited',
      })}
      meta={t`${joinedCount} joined · ${pendingCount} pending`}
      onClick={() => navigateSettings(SettingsPath.WorkspaceMembersPage)}
    />
  );
};
