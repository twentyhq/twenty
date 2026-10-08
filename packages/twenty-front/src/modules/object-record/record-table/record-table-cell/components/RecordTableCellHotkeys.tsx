import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordTableCellHotkeysEffect } from '@/object-record/record-table/record-table-cell/components/RecordTableCellHotkeysEffect';
import { RecordTableCellOnDemandFieldDisplay } from '@/object-record/record-table/record-table-cell/components/RecordTableCellOnDemandFieldDisplay';
import { useContext } from 'react';

type RecordTableCellHotkeysProps = {
  cellFocusId: string;
};

export const RecordTableCellHotkeys = ({
  cellFocusId,
}: RecordTableCellHotkeysProps) => {
  const { isOnDemand, recordId, fieldDefinition } = useContext(FieldContext);

  if (isOnDemand) {
    return (
      <RecordTableCellOnDemandFieldDisplay
        key={`${recordId}-${fieldDefinition.fieldMetadataId}`}
        cellFocusId={cellFocusId}
      />
    );
  }

  return <RecordTableCellHotkeysEffect cellFocusId={cellFocusId} />;
};
