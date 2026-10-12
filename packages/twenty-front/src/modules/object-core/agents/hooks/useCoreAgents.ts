import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CORE_AGENT_TABLE_COLUMNS } from '@/object-core/agents/constants/CoreAgentTableColumns';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableFieldMetadata } from '@/ui/layout/table/types/TableFieldMetadata';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
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
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);

  // Workflow steps and the agent page create and delete agents without touching this query's cache
  const { data, loading, error } = useQuery(FindManyAgentsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const listedAgents = useMemo(
    () =>
      (data?.findManyAgents ?? []).filter(
        (agent) => !agent.isSystem || isAdvancedModeEnabled,
      ),
    [data?.findManyAgents, isAdvancedModeEnabled],
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
