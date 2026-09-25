import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LOG_CONSOLE_APPLICATION_LOG_RETENTION_IN_DAYS } from '@/log-console/constants/LogConsoleApplicationLogRetentionInDays';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useLogConsoleRetention = (source: LogConsoleSource) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const retentionInDays = source.requiresAuditLogs
    ? (currentWorkspace?.eventLogRetentionDays ?? 90)
    : LOG_CONSOLE_APPLICATION_LOG_RETENTION_IN_DAYS;

  return {
    retentionInDays,
    retentionDescription: source.requiresAuditLogs
      ? t`Audit logs are kept ${retentionInDays} days.`
      : t`App logs are kept ${retentionInDays} days.`,
  };
};
