import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { getRecordTableColumnWidthRules } from '@/object-record/record-table/utils/getRecordTableColumnWidthRules';

export const RecordTableColumnWidthStyle = ({
  scopeId,
}: {
  scopeId: string;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <style>
      {getRecordTableColumnWidthRules({
        scopeSelector: `[id="${scopeId}"]`,
        columnCount: visibleRecordFields.length,
      })}
    </style>
  );
};
