import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { getWorkspaceMemberNameOrEmail } from 'twenty-shared/workspace';

export const getApplicationConnectedMemberName = ({
  workspaceMember,
}: Pick<SettingsApplicationConnectedMember, 'workspaceMember'>): string =>
  isDefined(workspaceMember)
    ? getWorkspaceMemberNameOrEmail(workspaceMember)
    : t`Unknown user`;
