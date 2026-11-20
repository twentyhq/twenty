import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getApplicationConnectedMemberName = ({
  workspaceMember,
}: Pick<SettingsApplicationConnectedMember, 'workspaceMember'>): string =>
  isDefined(workspaceMember)
    ? `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`.trim()
    : t`Unknown user`;
