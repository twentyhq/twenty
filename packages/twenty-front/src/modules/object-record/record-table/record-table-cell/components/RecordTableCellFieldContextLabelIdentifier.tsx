import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { isRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/utils/isRecordFieldReadOnly';
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
import { ReactNode, useContext } from 'react';
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

  const { columnDefinition } = useContext(RecordTableCellContext);
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

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: true,
        isLabelIdentifierCompact,
        displayedMaxRows: 1,
        isRecordFieldReadOnly: isRecordFieldReadOnly({
          objectPermissions,
          objectNameSingular: objectMetadataItem.nameSingular,
          fieldName: columnDefinition.metadata.fieldName,
          fieldType: columnDefinition.type,
          isCustom: objectMetadataItem.isCustom,
          fieldMetadataId: columnDefinition.fieldMetadataId,
          isRecordReadOnly: isRecordReadOnly ?? false,
        }),
        maxWidth: columnDefinition.size,
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
