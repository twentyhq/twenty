import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const getTimeZoneFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): string => {
  return workspaceMember.timeZone === 'system' || !workspaceMember.timeZone
    ? detectTimeZone()
    : workspaceMember.timeZone;
};
