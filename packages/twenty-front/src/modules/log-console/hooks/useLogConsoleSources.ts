import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { LOG_CONSOLE_SOURCES } from '@/log-console/constants/LogConsoleSources';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { logConsoleActiveSourceIdState } from '@/log-console/states/logConsoleActiveSourceIdState';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { BillingEntitlementKey } from '~/generated-metadata/graphql';

export const useLogConsoleSources = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [logConsoleActiveSourceId, setLogConsoleActiveSourceId] = useAtomState(
    logConsoleActiveSourceIdState,
  );
  const setLogConsoleFilters = useSetAtomState(logConsoleFiltersState);
  const setLogConsoleSelectedLog = useSetAtomState(logConsoleSelectedLogState);

  const hasAuditLogsEntitlement = checkIfBillingEntitlementIsEnabledOnWorkspace(
    BillingEntitlementKey.AUDIT_LOGS,
    currentWorkspace,
  );

  const isSourceLocked = (source: LogConsoleSource) =>
    source.requiresAuditLogs && !hasAuditLogsEntitlement;

  const sources = [
    ...LOG_CONSOLE_SOURCES.filter((source) => !isSourceLocked(source)),
    ...LOG_CONSOLE_SOURCES.filter(isSourceLocked),
  ];

  const activeSource =
    sources.find((source) => source.id === logConsoleActiveSourceId) ??
    sources[0];

  const changeSource = (sourceId: LogConsoleSourceId) => {
    const filterFields =
      sources.find((source) => source.id === sourceId)?.filterFields ?? [];

    setLogConsoleActiveSourceId(sourceId);
    setLogConsoleSelectedLog(null);
    setLogConsoleFilters((filters) =>
      filters.filter((filter) =>
        filterFields.some(
          (filterField) => filterField.id === filter.filterFieldId,
        ),
      ),
    );
  };

  return { sources, activeSource, isSourceLocked, changeSource };
};
