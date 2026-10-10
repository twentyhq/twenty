import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { EVENT_LOG_RETENTION } from 'twenty-shared/constants';
import { getEventLogRetentionInHours } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

export const useLogConsoleRetention = () => {
  const { t } = useLingui();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const hasAuditLogsEntitlement = checkIfBillingEntitlementIsEnabledOnWorkspace(
    BillingEntitlementKey.AUDIT_LOGS,
    currentWorkspace,
  );

  const retentionInHours = getEventLogRetentionInHours({
    workspaceRetentionInDays:
      currentWorkspace?.eventLogRetentionDays ??
      EVENT_LOG_RETENTION.defaultInDays,
    hasAuditLogsEntitlement,
  });

  const retentionInDays = retentionInHours / 24;

  const retentionLabel =
    retentionInHours < 24
      ? plural(retentionInHours, { one: '# hour', other: '# hours' })
      : plural(retentionInDays, { one: '# day', other: '# days' });

  return {
    retentionInHours,
    retentionLabel,
    isRetentionConfigurable: hasAuditLogsEntitlement,
    retentionDescription: t`Logs are kept ${retentionLabel}.`,
  };
};
