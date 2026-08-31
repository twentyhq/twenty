import { useState } from 'react';

import { useQuery } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useDebounce } from 'use-debounce';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { coreWorkflowsSearchTermState } from '@/object-core/workflows/states/coreWorkflowsSearchTermState';
import { coreWorkflowsStatusesFilterState } from '@/object-core/workflows/states/coreWorkflowsStatusesFilterState';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { type TableSortValue } from '@/ui/layout/table/types/TableSortValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  CoreWorkflowOrderByDirection,
  CoreWorkflowOrderByField,
  GetCoreWorkflowsDocument,
} from '~/generated/graphql';

export const CORE_WORKFLOWS_TABLE_ID = 'workflowCore';
export const CORE_WORKFLOWS_PAGE_SIZE = 60;
export const CORE_WORKFLOWS_SEARCH_DEBOUNCE_MS = 300;

export const CORE_WORKFLOWS_INITIAL_SORT: TableSortValue = {
  fieldName: 'updatedAt',
  direction: 'desc',
};

const ORDER_BY_FIELD_BY_FIELD_NAME: Record<string, CoreWorkflowOrderByField> = {
  name: CoreWorkflowOrderByField.NAME,
  updatedAt: CoreWorkflowOrderByField.UPDATED_AT,
};

export const useCoreWorkflows = () => {
  const apolloCoreClient = useApolloCoreClient();

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    { tableId: CORE_WORKFLOWS_TABLE_ID },
  );

  const sortValue = sortedFieldByTable ?? CORE_WORKFLOWS_INITIAL_SORT;

  const orderBy =
    ORDER_BY_FIELD_BY_FIELD_NAME[sortValue.fieldName] ??
    CoreWorkflowOrderByField.UPDATED_AT;
  const orderByDirection =
    sortValue.direction === 'asc'
      ? CoreWorkflowOrderByDirection.ASC
      : CoreWorkflowOrderByDirection.DESC;

  const coreWorkflowsStatusesFilter = useAtomStateValue(
    coreWorkflowsStatusesFilterState,
  );
  const coreWorkflowsSearchTerm = useAtomStateValue(
    coreWorkflowsSearchTermState,
  );

  const trimmedSearchTerm = coreWorkflowsSearchTerm.trim();
  const [debouncedSearchTerm] = useDebounce(
    trimmedSearchTerm,
    CORE_WORKFLOWS_SEARCH_DEBOUNCE_MS,
  );

  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data, previousData, loading, error, fetchMore } = useQuery(
    GetCoreWorkflowsDocument,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      variables: {
        first: CORE_WORKFLOWS_PAGE_SIZE,
        orderBy,
        orderByDirection,
        statuses:
          coreWorkflowsStatusesFilter.length > 0
            ? coreWorkflowsStatusesFilter
            : undefined,
        searchTerm: isNonEmptyString(debouncedSearchTerm)
          ? debouncedSearchTerm
          : undefined,
      },
    },
  );

  // falling back to the previous page keeps the list rendered while a filter
  // change is in flight
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
    loading,
    error,
  };
};
