import { useEffect } from 'react';

import { turnFiltersIntoWhereClauseV2 } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderByV2';
import { useSetRecordTableData } from '@/ui/object/record-table/hooks/useSetRecordTableData';
import { TableRecoilScopeContext } from '@/ui/object/record-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableFiltersScopedState } from '@/ui/object/record-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/object/record-table/states/tableSortsScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { useFindManyObjects } from '../hooks/useFindManyObjects';
import { useObjectMetadataItemInContext } from '../hooks/useObjectMetadataItemInContext';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

export type ObjectRecordTableEffectProps = Pick<
  ObjectMetadataItemIdentifier,
  'objectNamePlural'
>;

// This should be migrated to RecordTable at some point
export const ObjectRecordTableEffect = ({
  objectNamePlural,
}: ObjectRecordTableEffectProps) => {
  const setRecordTableData = useSetRecordTableData();
  const { foundObjectMetadataItem } = useObjectMetadataItemInContext();

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
      foundObjectMetadataItem?.fields ?? [],
    ),
    orderBy: turnSortsIntoOrderByV2(
      tableSorts,
      foundObjectMetadataItem?.fields ?? [],
    ),
  });

  useEffect(() => {
    if (!loading) {
      const entities = objects ?? [];

      setRecordTableData(entities);
    }
  }, [objects, setRecordTableData, loading]);

  return <></>;
};
