import { useQuery } from '@apollo/client/react';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { useCanReadCoreAgentRuns } from '@/object-core/agents/hooks/useCanReadCoreAgentRuns';
import { useListenToCoreAgentRunEvents } from '@/object-core/agents/hooks/useListenToCoreAgentRunEvents';
import { type CoreAgentTableRow } from '@/object-core/agents/types/CoreAgentTableRow';
import { buildCoreAgentTableRows } from '@/object-core/agents/utils/buildCoreAgentTableRows';
import { isCoreAgentMatchingFilterSettings } from '@/object-core/agents/utils/isCoreAgentMatchingFilterSettings';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  FindManyAgentsDocument,
  GetAgentRunSummariesDocument,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const CORE_AGENTS_TABLE_ID = 'coreAgents';

export const CORE_AGENTS_INITIAL_SORT: TableSortValue = {
  fieldName: 'updatedAt',
  direction: 'desc',
};

const CORE_AGENTS_SORTABLE_FIELDS = CORE_AGENT_TABLE_COLUMNS.flatMap(
  ({ fieldName, fieldLabel, fieldType, align }) =>
    isDefined(fieldType) ? [{ fieldName, fieldLabel, fieldType, align }] : [],
) satisfies TableFieldMetadata<CoreAgentTableRow>[];

export const useCoreAgents = ({
  tableId = CORE_AGENTS_TABLE_ID,
}: {
  tableId?: string;
} = {}) => {
  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  // Workflow steps and the agent page create and delete agents without touching this query's cache
  const { data, loading, error, refetch } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const canReadCoreAgentRuns = useCanReadCoreAgentRuns();

  const { data: runSummariesData, refetch: refetchRunSummaries } = useQuery(
    GetAgentRunSummariesDocument,
    {
      fetchPolicy: 'cache-and-network',
      skip: !canReadCoreAgentRuns,
    },
  );

  useListenToCoreAgentRunEvents({
    onRunsChanged: () => {
      if (canReadCoreAgentRuns) {
        void refetchRunSummaries().catch(logError);
      }
    },
  });

  const refetchCoreAgents = useCallback(() => {
    void refetch().catch(logError);
  }, [refetch]);

  const listedAgents = useMemo(
    () =>
      buildCoreAgentTableRows({
        coreAgents: (data?.findManyAgents ?? []).filter((agent) =>
          isCoreAgentMatchingFilterSettings({
            agent,
            filterSettings: coreAgentsFilterSettings,
          }),
        ),
        runSummaries: runSummariesData?.agentRunSummaries ?? null,
      }),
    [
      data?.findManyAgents,
      runSummariesData?.agentRunSummaries,
      coreAgentsFilterSettings,
    ],
  );

  const tableMetadata = useMemo(
    () => ({
      tableId,
      fields: CORE_AGENTS_SORTABLE_FIELDS,
      initialSort: CORE_AGENTS_INITIAL_SORT,
    }),
    [tableId],
  );

  const coreAgents = useSortedArray(listedAgents, tableMetadata);

  return {
    coreAgents,
    refetchCoreAgents,
    isInitialLoading: loading && !isDefined(data),
    error,
  };
};
