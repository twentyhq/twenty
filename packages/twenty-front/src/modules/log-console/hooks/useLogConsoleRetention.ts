import { useLingui } from '@lingui/react/macro';
import { EVENT_LOG_RETENTION_IN_DAYS } from 'twenty-shared/constants';
import { getEventLogRetentionInDays } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import {
  BillingEntitlementKey,
  EventLogTable,
} from '~/generated-metadata/graphql';

export const useLogConsoleRetention = (source: LogConsoleSource) => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isApplicationLog = source.table === EventLogTable.APPLICATION_LOG;
  const hasAuditLogsEntitlement = checkIfBillingEntitlementIsEnabledOnWorkspace(
    BillingEntitlementKey.AUDIT_LOGS,
    currentWorkspace,
  );

  const retentionInDays = getEventLogRetentionInDays({
    table: source.table,
    workspaceRetentionInDays:
      currentWorkspace?.eventLogRetentionDays ??
      EVENT_LOG_RETENTION_IN_DAYS.default,
    hasAuditLogsEntitlement,
  });

  return {
    retentionInDays,
    isRetentionConfigurable: !isApplicationLog && hasAuditLogsEntitlement,
    retentionDescription: isApplicationLog
      ? t`App logs are kept ${retentionInDays} days.`
      : t`Audit logs are kept ${retentionInDays} days.`,
  };
};
