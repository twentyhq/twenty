import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { isCoreAgentMatchingFilterSettings } from '@/object-core/agents/utils/isCoreAgentMatchingFilterSettings';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindManyAgentsDocument } from '~/generated-metadata/graphql';

export const CORE_AGENTS_TABLE_ID = 'coreAgents';

export const CORE_AGENTS_INITIAL_SORT: TableSortValue = {
  fieldName: 'updatedAt',
  direction: 'desc',
};

const CORE_AGENTS_SORTABLE_FIELDS = CORE_AGENT_TABLE_COLUMNS.flatMap(
  ({ fieldName, fieldLabel, fieldType, align }) =>
    isDefined(fieldType) ? [{ fieldName, fieldLabel, fieldType, align }] : [],
) satisfies TableFieldMetadata<CoreAgent>[];

export const useCoreAgents = ({
  tableId = CORE_AGENTS_TABLE_ID,
}: {
  tableId?: string;
} = {}) => {
  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  // Workflow steps and the agent page create and delete agents without touching this query's cache
  const { data, loading, error } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const listedAgents = useMemo(
    () =>
      (data?.findManyAgents ?? []).filter((agent) =>
        isCoreAgentMatchingFilterSettings({
          agent,
          filterSettings: coreAgentsFilterSettings,
        }),
      ),
    [data?.findManyAgents, coreAgentsFilterSettings],
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
    isInitialLoading: loading && !isDefined(data),
    error,
  };
};
