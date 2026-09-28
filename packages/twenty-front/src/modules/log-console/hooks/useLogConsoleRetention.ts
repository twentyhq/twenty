import { useLingui } from '@lingui/react/macro';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LOG_CONSOLE_APPLICATION_LOG_RETENTION_IN_DAYS } from '@/log-console/constants/LogConsoleApplicationLogRetentionInDays';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { EventLogTable } from '~/generated-metadata/graphql';

export const useLogConsoleRetention = (source: LogConsoleSource) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isApplicationLog = source.table === EventLogTable.APPLICATION_LOG;

  const retentionInDays = isApplicationLog
    ? LOG_CONSOLE_APPLICATION_LOG_RETENTION_IN_DAYS
    : (currentWorkspace?.eventLogRetentionDays ?? 90);

  return {
    retentionInDays,
    retentionDescription: isApplicationLog
      ? t`App logs are kept ${retentionInDays} days.`
      : t`Audit logs are kept ${retentionInDays} days.`,
  };
};
