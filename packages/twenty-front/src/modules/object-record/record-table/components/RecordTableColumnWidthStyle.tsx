import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableColumnWidthRules } from '@/object-record/record-table/utils/getRecordTableColumnWidthRules';
import { useMemo } from 'react';

export const RecordTableColumnWidthStyle = ({
  scopeId,
}: {
  scopeId: string;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const columnWidthRules = useMemo(
    () =>
      getRecordTableColumnWidthRules({
        scopeSelector: `[id="${scopeId}"]`,
        columnCount: visibleRecordFields.length,
      }),
    [scopeId, visibleRecordFields.length],
  );

  return <style>{columnWidthRules}</style>;
};
