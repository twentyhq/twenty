import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export const getTimeZoneFromWorkspaceMember = (
  workspaceMember: WorkspaceMember | CurrentWorkspaceMember,
): string => {
  // The stored value is normalized because the backend accepts any string for
  // `timeZone`, so legacy aliases (e.g. `CET`) can be persisted and would crash
  // WebKit's date formatting.
  return workspaceMember.timeZone === 'system' || !workspaceMember.timeZone
    ? detectTimeZone()
    : normalizeTimeZone(workspaceMember.timeZone);
};
