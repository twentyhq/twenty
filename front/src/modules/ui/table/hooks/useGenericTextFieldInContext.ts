import { useContext } from 'react';
import { useRecoilState } from 'recoil';

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

  const updateField = useUpdateEntityField();

  const [fieldValue, setFieldValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.fieldName,
    }),
  );

  function updateTextField(newValue: string) {
    if (currentRowEntityId && updateField) {
      updateField(currentRowEntityId, columnDefinition, newValue);
    }
  }

  return {
    fieldValue,
    setFieldValue,
    updateTextField,
    fieldMetaData: columnDefinition.metadata,
  };
}
