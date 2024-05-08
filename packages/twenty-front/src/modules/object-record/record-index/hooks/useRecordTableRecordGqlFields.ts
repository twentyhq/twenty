import { useRecoilValue } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';

export const useRecordTableRecordGqlFields = () => {
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const recordGqlFields: Record<string, any> = {
    id: true,
    ...Object.fromEntries(
      visibleTableColumns.map((column) => [column.metadata.fieldName, true]),
    ),
    position: true,
  };

  return recordGqlFields;
};
