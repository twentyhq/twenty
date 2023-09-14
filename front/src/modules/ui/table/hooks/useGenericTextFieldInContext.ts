import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { EditableFieldDefinitionContext } from '@/ui/editable-field/contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '@/ui/editable-field/contexts/EditableFieldEntityIdContext';
import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '@/ui/editable-field/states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import { FieldTextMetadata } from '@/ui/editable-field/types/FieldMetadata';
import { ViewFieldTextMetadata } from '@/ui/editable-field/types/ViewField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { ColumnContext } from '../contexts/ColumnContext';
import { ColumnDefinition } from '../types/ColumnDefinition';

import { useCurrentRowEntityId } from './useCurrentEntityId';
import { useUpdateEntityField } from './useUpdateEntityField';

export function useGenericTextFieldInContext() {
  const currentRowEntityId = useCurrentRowEntityId();
  const columnDefinition = useContext(
    ColumnContext,
  ) as ColumnDefinition<ViewFieldTextMetadata>;

  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const fieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldTextMetadata>;

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    currentRowEntityId
      ? tableEntityFieldFamilySelector({
          entityId: currentRowEntityId ?? '',
          fieldName: columnDefinition.metadata.fieldName,
        })
      : genericEntityFieldFamilySelector({
          entityId: currentEditableFieldEntityId ?? '',
          fieldName: fieldDefinition.metadata.fieldName,
        }),
  );

  const updateTableEntityField = useUpdateEntityField();

  function updateField(newValue: string) {
    if (currentRowEntityId && columnDefinition.metadata.fieldName) {
      updateTableEntityField(currentRowEntityId, columnDefinition, newValue);
    } else if (currentEditableFieldEntityId) {
      const updateGenericEntityField = useUpdateGenericEntityField();
      updateGenericEntityField(
        currentEditableFieldEntityId,
        fieldDefinition,
        newValue,
      );
    }
  }

  const fieldMetaData = columnDefinition
    ? columnDefinition.metadata
    : fieldDefinition.metadata;

  return {
    fieldValue,
    setFieldValue,
    updateField,
    fieldMetaData,
  };
}
