import { useEffect } from 'react';

import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableFiltersScopedState } from '@/ui/data/data-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/data/data-table/states/tableSortsScopedState';
import { turnFiltersIntoWhereClauseV2 } from '@/ui/data/filter/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/data/sort/utils/turnSortsIntoOrderByV2';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useFindManyObjects } from '../hooks/useFindManyObjects';
import { useMetadataObjectInContext } from '../hooks/useMetadataObjectInContext';
import { useSetObjectDataTableData } from '../hooks/useSetDataTableData';
import { MetadataObjectIdentifier } from '../types/MetadataObjectIdentifier';

export type ObjectDataTableEffectProps = Pick<
  MetadataObjectIdentifier,
  'objectNamePlural'
>;

// This should be migrated to DataTable at some point
export const ObjectDataTableEffect = ({
  objectNamePlural,
}: ObjectDataTableEffectProps) => {
  const setDataTableData = useSetObjectDataTableData();
  const { foundMetadataObject } = useMetadataObjectInContext();

  const tableFilters = useRecoilScopedValue(
    tableFiltersScopedState,
    TableRecoilScopeContext,
  );

  const tableSorts = useRecoilScopedValue(
    tableSortsScopedState,
    TableRecoilScopeContext,
  );

  const { objects, loading } = useFindManyObjects({
    objectNamePlural: objectNamePlural,
    filter: turnFiltersIntoWhereClauseV2(
      tableFilters,
      foundMetadataObject?.fields ?? [],
    ),
    orderBy: turnSortsIntoOrderByV2(
      tableSorts,
      foundMetadataObject?.fields ?? [],
    ),
  });

  useEffect(() => {
    if (!loading) {
      const entities = objects ?? [];

      setDataTableData(entities);
    }
  }, [objects, setDataTableData, loading]);

  return <></>;
};
