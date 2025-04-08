import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextGeneric } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextGeneric';
import { RecordTableCellFieldContextLabelIdentifier } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextLabelIdentifier';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { ReactNode, useContext } from 'react';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type RecordTableCellFieldContextWrapperProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextWrapper = ({
  children,
}: RecordTableCellFieldContextWrapperProps) => {
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId } = useRecordTableRowContextOrThrow();
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  if (isUndefinedOrNull(columnDefinition)) {
    return null;
  }

  const instanceId = getRecordFieldInputId(
    recordId,
    columnDefinition.metadata.fieldName,
    'record-table-cell',
  );

  const isLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: {
      id: columnDefinition.fieldMetadataId,
      name: columnDefinition.metadata.fieldName,
    },
    objectMetadataItem,
  });

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      {isLabelIdentifier ? (
        <RecordTableCellFieldContextLabelIdentifier>
          {children}
        </RecordTableCellFieldContextLabelIdentifier>
      ) : (
        <RecordTableCellFieldContextGeneric>
          {children}
        </RecordTableCellFieldContextGeneric>
      )}
    </RecordFieldComponentInstanceContext.Provider>
  );
};
