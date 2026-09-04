import { useState } from 'react';

import { useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { buildCoreWorkflowFilterInput } from '@/object-core/workflows/utils/buildCoreWorkflowFilterInput';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  GetCoreWorkflowsDocument,
} from '~/generated/graphql';

export const CORE_WORKFLOWS_TABLE_ID = 'workflowCore';
export const CORE_WORKFLOWS_PAGE_SIZE = 60;

export const CORE_WORKFLOWS_INITIAL_SORT: TableSortValue = {
  fieldName: 'updatedAt',
  direction: 'desc',
};

const ORDER_BY_FIELD_BY_FIELD_NAME: Record<string, CoreWorkflowOrderByField> = {
  name: CoreWorkflowOrderByField.NAME,
  updatedAt: CoreWorkflowOrderByField.UPDATED_AT,
};

export const useCoreWorkflows = ({
  tableId = CORE_WORKFLOWS_TABLE_ID,
}: {
  tableId?: string;
} = {}) => {
  const apolloCoreClient = useApolloCoreClient();
  const scopedTableId = useWorkspaceSurfaceScopedComponentInstanceId(tableId);

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    { tableId: scopedTableId },
  );

  const sortValue = sortedFieldByTable ?? CORE_WORKFLOWS_INITIAL_SORT;

  const orderBy =
    ORDER_BY_FIELD_BY_FIELD_NAME[sortValue.fieldName] ??
    CoreWorkflowOrderByField.UPDATED_AT;
  const orderByDirection =
    sortValue.direction === 'asc'
      ? CoreWorkflowOrderByDirection.ASC
      : CoreWorkflowOrderByDirection.DESC;

  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const { userTimezone } = useUserTimezone();
  const filter = buildCoreWorkflowFilterInput({
    filterSettings: coreWorkflowsFilterSettings,
    timezone: userTimezone,
  });

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data, previousData, loading, error, fetchMore, refetch } = useQuery(
    GetCoreWorkflowsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      variables: {
        first: CORE_WORKFLOWS_PAGE_SIZE,
        orderBy,
        orderByDirection,
        filter,
      },
    },
  );
  const connection = (data ?? previousData)?.coreWorkflows;

  const fetchNextPage = async () => {
    if (connection?.pageInfo.hasNextPage !== true || isFetchingMore) {
      return;
    }

    setIsFetchingMore(true);

    await fetchMore({
      variables: { after: connection.pageInfo.endCursor },
      updateQuery: (previousResult, { fetchMoreResult }) => ({
        ...fetchMoreResult,
        coreWorkflows: {
          ...fetchMoreResult.coreWorkflows,
          edges: [
            ...previousResult.coreWorkflows.edges,
            ...fetchMoreResult.coreWorkflows.edges,
          ],
        },
      }),
    }).finally(() => {
      setIsFetchingMore(false);
    });
  };

  return {
    coreWorkflows: connection?.edges.map((edge) => edge.node) ?? [],
    totalCount: connection?.totalCount ?? 0,
    hasNextPage: connection?.pageInfo.hasNextPage ?? false,
    fetchNextPage,
    refetch,
    loading,
    error,
  };
};
