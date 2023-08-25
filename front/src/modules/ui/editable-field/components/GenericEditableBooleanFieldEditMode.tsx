import { useContext } from 'react';
import { useRecoilState } from 'recoil';

import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { StyledDropdownMenu } from '@/ui/dropdown/components/StyledDropdownMenu';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useEditableField } from '../hooks/useEditableField';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldBooleanMetadata } from '../types/FieldMetadata';

export function GenericEditableBooleanFieldEditMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldBooleanMetadata>;

  // TODO: we could use a hook that would return the field value with the right type
  const [fieldValue, setFieldValue] = useRecoilState<boolean>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const updateField = useUpdateGenericEntityField();
  const { closeEditableField } = useEditableField();

  function handleSubmit(newValue: boolean) {
    if (newValue === fieldValue) return;

    setFieldValue(newValue);

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newValue,
      );
    }

    closeEditableField();
  }

  return (
    <StyledDropdownMenu>
      <StyledDropdownMenuItemsContainer hasMaxHeight>
        {['true', 'false'].map((value) => (
          <DropdownMenuSelectableItem
            key={value}
            selected={fieldValue === (value === 'true')}
            onClick={() => handleSubmit(value === 'true')}
          >
            {value === 'true' ? 'True' : 'False'}
          </DropdownMenuSelectableItem>
        ))}
      </StyledDropdownMenuItemsContainer>
    </StyledDropdownMenu>
  );
}
