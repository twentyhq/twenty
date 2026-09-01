import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { recordFieldListCellEditModePositionComponentState } from '@/object-record/record-field-list/states/recordFieldListCellEditModePositionComponentState';
import { FieldInputEventContextProvider } from '@/object-record/record-field/ui/components/FieldInputEventContextProvider';
import { useOpenFieldInputEditMode } from '@/object-record/record-field/ui/hooks/useOpenFieldInputEditMode';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useCallback } from 'react';

type RecordFieldListInputContextProviderProps = {
  children: React.ReactNode;
  recordId: string;
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceIdPrefix: string;
};

export const RecordFieldListInputContextProvider = ({
  children,
  recordId,
  fieldMetadataItem,
  objectMetadataItem,
  instanceIdPrefix,
}: RecordFieldListInputContextProviderProps) => {
  const { closeFieldInput } = useOpenFieldInputEditMode();

  const setRecordFieldListCellEditModePosition = useSetAtomComponentState(
    recordFieldListCellEditModePositionComponentState,
  );

  const fieldDefinition = formatFieldMetadataItemAsFieldDefinition({
    field: fieldMetadataItem,
    objectMetadataItem,
  });

  const closeInlineCellAndResetEditModePosition = useCallback(() => {
    setRecordFieldListCellEditModePosition(null);

    closeFieldInput({
      fieldDefinition,
      recordId,
      prefix: instanceIdPrefix,
    });
  }, [
    setRecordFieldListCellEditModePosition,
    closeFieldInput,
    fieldDefinition,
    recordId,
    instanceIdPrefix,
  ]);

  return (
    <FieldInputEventContextProvider
      onClose={closeInlineCellAndResetEditModePosition}
    >
      {children}
    </FieldInputEventContextProvider>
  );
};
