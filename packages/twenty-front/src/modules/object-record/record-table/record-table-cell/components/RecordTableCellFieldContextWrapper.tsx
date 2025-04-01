import { ReactNode, useContext } from 'react';

import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
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
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { RelationDefinitionType } from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { useIsMobile } from 'twenty-ui';
import { isRecordTableScrolledLeftComponentState } from '../../states/isRecordTableScrolledLeftComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const RecordTableCellFieldContext = ({ children }: { children: ReactNode }) => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId } = useRecordTableRowContextOrThrow();
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
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};

export const RecordTableCellFieldContextWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { columnDefinition } = useContext(RecordTableCellContext);
  const { recordId } = useRecordTableRowContextOrThrow();

  if (isUndefinedOrNull(columnDefinition)) {
    return null;
  }

  const instanceId = getRecordFieldInputId(
    recordId,
    columnDefinition.metadata.fieldName,
    'record-table-cell',
  );

  return (
    <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordTableCellFieldContext>{children}</RecordTableCellFieldContext>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
