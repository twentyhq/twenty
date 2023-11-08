import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { RecordTableScopeInternalContext } from '@/ui/object/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { onColumnsChangeScopedState } from '@/ui/object/record-table/states/onColumnsChangeScopedState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { getScopedState } from '@/ui/utilities/recoil-scope/utils/getScopedState';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { FieldMetadata } from '../../field/types/FieldMetadata';
import { onEntityCountChangeScopedState } from '../states/onEntityCountChange';
import { ColumnDefinition } from '../types/ColumnDefinition';

import { useRecordTableScopedStates } from './internal/useRecordTableScopedStates';
import { useSetRecordTableData } from './internal/useSetRecordTableData';

type useRecordTableProps = {
  recordTableScopeId?: string;
};

export const useRecordTable = (props?: useRecordTableProps) => {
  const scopeId = useAvailableScopeIdOrThrow(
    RecordTableScopeInternalContext,
    props?.recordTableScopeId,
  );

  const { availableTableColumnsState, tableFiltersState, tableSortsState } =
    useRecordTableScopedStates({
      customRecordTableScopeId: scopeId,
    });

  const setAvailableTableColumns = useSetRecoilState(
    availableTableColumnsState,
  );

  const setTableFilters = useSetRecoilState(tableFiltersState);

  const setTableSorts = useSetRecoilState(tableSortsState);

  const onColumnsChange = useRecoilCallback(
    ({ snapshot }) =>
      (columns: ColumnDefinition<FieldMetadata>[]) => {
        const onColumnsChangeState = getScopedState(
          onColumnsChangeScopedState,
          scopeId,
        );
        const onColumnsChange = getSnapshotValue(
          snapshot,
          onColumnsChangeState,
        );

        onColumnsChange?.(columns);
      },
    [scopeId],
  );

  const onEntityCountChange = useRecoilCallback(
    ({ snapshot }) =>
      (count: number) => {
        const onEntityCountChangeState = getScopedState(
          onEntityCountChangeScopedState,
          scopeId,
        );
        const onEntityCountChange = getSnapshotValue(
          snapshot,
          onEntityCountChangeState,
        );

        onEntityCountChange?.(count);
      },
    [scopeId],
  );

  const setRecordTableData = useSetRecordTableData({ onEntityCountChange });

  return {
    scopeId,
    onColumnsChange,
    setAvailableTableColumns,
    setTableFilters,
    setTableSorts,
    setRecordTableData,
  };
};
