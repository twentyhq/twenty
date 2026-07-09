import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const getTimeZoneFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): string => {
  const timeZone =
    workspaceMember.timeZone === 'system' || !workspaceMember.timeZone
      ? detectTimeZone()
      : workspaceMember.timeZone;

  return normalizeTimeZone(timeZone);
};
