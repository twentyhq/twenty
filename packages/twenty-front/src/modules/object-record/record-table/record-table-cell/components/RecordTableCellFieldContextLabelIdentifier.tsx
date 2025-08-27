import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useContext, type ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { useIsMobile } from 'twenty-ui/utilities';

type RecordTableCellFieldContextLabelIdentifierProps = {
  children: ReactNode;
};

export const RecordTableCellFieldContextLabelIdentifier = ({
  children,
}: RecordTableCellFieldContextLabelIdentifierProps) => {
  const { indexIdentifierUrl, objectPermissionsByObjectMetadataId } =
    useRecordIndexContextOrThrow();
  const { recordId, isRecordReadOnly } = useRecordTableRowContextOrThrow();
  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordTableContextOrThrow();

  const { recordField } = useContext(RecordTableCellContext);
  const { objectMetadataItem, recordTableId } = useRecordTableContextOrThrow();
  const { rowIndex } = useRecordTableRowContextOrThrow();
  const { activateRecordTableRow } = useActiveRecordTableRow(recordTableId);
  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const isMobile = useIsMobile();
  const isRecordTableScrolledLeftComponent = useRecoilComponentValue(
    isRecordTableScrolledLeftComponentState,
  );

  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    objectMetadataItem.id,
  );

  const hasObjectReadPermissions = objectPermissions.canReadObjectRecords;

  const updateRecord = useContext(RecordUpdateContext);

  const isLabelIdentifierCompact =
    isMobile && !isRecordTableScrolledLeftComponent;

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);
  const triggerEvent =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
      ? 'CLICK'
      : 'MOUSE_DOWN';

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: true,
        isLabelIdentifierCompact,
        displayedMaxRows: 1,
        isRecordFieldReadOnly: isRecordFieldReadOnly({
          isRecordReadOnly: isRecordReadOnly ?? false,
          objectPermissions,
          fieldMetadataItem: {
            id: recordField.fieldMetadataItemId,
            isUIReadOnly: fieldDefinition.metadata.isUIReadOnly ?? false,
          },
        }),
        maxWidth: recordField.size,
        onRecordChipClick: () => {
          activateRecordTableRow(rowIndex);
          unfocusRecordTableRow();
          openRecordFromIndexView({ recordId });
        },
        isForbidden: !hasObjectReadPermissions,
        triggerEvent,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
