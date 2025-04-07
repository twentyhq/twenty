import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { isFieldSelect } from '@/object-record/record-field/types/guards/isFieldSelect';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { SelectFieldHotkeyScope } from '@/object-record/select/types/SelectFieldHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ReactNode, useContext } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { isRecordTableScrolledLeftComponentState } from '../../states/isRecordTableScrolledLeftComponentState';

export const RecordTableCellFieldContext = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId, isReadOnly: isTableRowReadOnly } =
    useRecordTableRowContextOrThrow();
  const updateRecord = useContext(RecordUpdateContext);
  const isMobile = useIsMobile();

  const isRecordTableScrolledLeft = useRecoilComponentValueV2(
    isRecordTableScrolledLeftComponentState,
  );

  const isLabelHidden =
    isMobile &&
    columnDefinition?.isLabelIdentifier &&
    !isRecordTableScrolledLeft;

  const computedHotkeyScope = (
    columnDefinition: ColumnDefinition<FieldMetadata>,
  ) => {
    if (isFieldRelation(columnDefinition)) {
      if (
        columnDefinition.metadata.relationType ===
        RelationDefinitionType.MANY_TO_ONE
      ) {
        return SingleRecordPickerHotkeyScope.SingleRecordPicker;
      }

      if (
        columnDefinition.metadata.relationType ===
        RelationDefinitionType.ONE_TO_MANY
      ) {
        return MultipleRecordPickerHotkeyScope.MultipleRecordPicker;
      }

      return SingleRecordPickerHotkeyScope.SingleRecordPicker;
    }

    if (isFieldSelect(columnDefinition)) {
      return SelectFieldHotkeyScope.SelectField;
    }

    return TableHotkeyScope.CellEditMode;
  };

  const customHotkeyScope = computedHotkeyScope(columnDefinition);

  const isFieldReadOnly = useIsFieldValueReadOnly({
    fieldDefinition: columnDefinition,
    isRecordReadOnly: isTableRowReadOnly ?? false,
  });

  return (
    <FieldContext.Provider
      value={{
        recordId,
        fieldDefinition: columnDefinition,
        useUpdateRecord: () => [updateRecord, {}],
        hotkeyScope: customHotkeyScope,
        labelIdentifierLink: indexIdentifierUrl(recordId),
        isLabelIdentifier: isLabelIdentifierField({
          fieldMetadataItem: {
            id: columnDefinition.fieldMetadataId,
            name: columnDefinition.metadata.fieldName,
          },
          objectMetadataItem,
        }),
        displayedMaxRows: 1,
        isLabelHidden,
        isReadOnly: isFieldReadOnly,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
