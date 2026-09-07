import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { FieldInput } from '@/object-record/record-field/ui/components/FieldInput';
import { FieldInputEventContextProvider } from '@/object-record/record-field/ui/components/FieldInputEventContextProvider';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { RecordInlineCellAnchoredPortal } from '@/object-record/record-inline-cell/components/RecordInlineCellAnchoredPortal';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTargetsInlineCellProps = {
  objectNameSingular: string;
  recordId: string;
  instanceIdPrefix: string;
  showLabel?: boolean;
};

export const RecordTargetsInlineCell = ({
  objectNameSingular,
  recordId,
  instanceIdPrefix,
  showLabel = false,
}: RecordTargetsInlineCellProps) => {
  const junctionConfig = useObjectMorphJunctionConfig({ objectNameSingular });
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { openFieldInput, closeFieldInput } = useOpenFieldInputEditMode();

  const [isEditing, setIsEditing] = useState(false);

  if (!isDefined(junctionConfig)) {
    return null;
  }

  const junctionField = junctionConfig.junctionField;

  const fieldInstanceId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: junctionField.name,
    prefix: instanceIdPrefix,
  });

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: junctionField,
    objectMetadataItem,
  });

  // Opening pushes the picker onto the focus stack, so closing has to pop it or
  // the app keeps treating this dropdown as focused.
  const closeEditMode = () => {
    setIsEditing(false);

    closeFieldInput({ fieldDefinition, recordId, prefix: instanceIdPrefix });
  };

  const openEditMode = () => {
    setIsEditing(true);

    openFieldInput({ fieldDefinition, recordId, prefix: instanceIdPrefix });
  };

  return (
    <FieldContextProvider
      objectNameSingular={objectNameSingular}
      objectRecordId={recordId}
      fieldMetadataName={junctionField.name}
      fieldPosition={0}
      showLabel={showLabel}
      isDisplayModeFixHeight
      anchorId={fieldInstanceId}
      onOpenEditMode={openEditMode}
      onCloseEditMode={closeEditMode}
    >
      <RecordFieldsScopeContextProvider
        value={{ scopeInstanceId: instanceIdPrefix }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{ instanceId: fieldInstanceId }}
        >
          <RecordInlineCell instanceIdPrefix={instanceIdPrefix} />

          {/* RecordInlineCell only renders display mode; the field input lives in
              an anchored portal that each container mounts for itself. */}
          {isEditing && (
            <RecordInlineCellAnchoredPortal
              fieldMetadataItem={junctionField}
              objectMetadataItem={objectMetadataItem}
              recordId={recordId}
              instanceIdPrefix={instanceIdPrefix}
              onCloseEditMode={closeEditMode}
            >
              <FieldInputEventContextProvider onClose={closeEditMode}>
                <RecordInlineCellEditMode>
                  <FieldInput />
                </RecordInlineCellEditMode>
              </FieldInputEventContextProvider>
            </RecordInlineCellAnchoredPortal>
          )}
        </RecordFieldComponentInstanceContext.Provider>
      </RecordFieldsScopeContextProvider>
    </FieldContextProvider>
  );
};
