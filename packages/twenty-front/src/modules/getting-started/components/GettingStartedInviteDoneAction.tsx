import { GettingStartedDoneCard } from '@/getting-started/components/GettingStartedDoneCard';
import { useQuery } from '@apollo/client/react';
import { plural } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconUsers } from 'twenty-ui/icon';
import { GetWorkspaceInvitationsDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const GettingStartedInviteDoneAction = () => {
  const navigateSettings = useNavigateSettings();
  const { data } = useQuery(GetWorkspaceInvitationsDocument);

  if (!isDefined(data)) {
    return null;
  }

  const invitationCount = data.findWorkspaceInvitations.length;

  return (
    <GettingStartedDoneCard
      Icon={IconUsers}
      title={plural(invitationCount, {
        one: '# invitation sent',
        other: '# invitations sent',
      })}
      onClick={() => navigateSettings(SettingsPath.WorkspaceMembersPage)}
    />
  );
};
