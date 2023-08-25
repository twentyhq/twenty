import { useContext } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconCheck, IconX } from '@/ui/icon';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldBooleanMetadata } from '../types/FieldMetadata';

const StyledEditableBooleanFieldContainer = styled.div`
  cursor: pointer;
  display: flex;
`;
const StyledBooleanFieldIcon = styled.div``;
const StyledEditableBooleanFieldValue = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

export function GenericEditableBooleanFieldDisplayMode() {
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldBooleanMetadata>;

  const [fieldValue, setFieldValue] = useRecoilState<boolean>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const theme = useTheme();
  const updateField = useUpdateGenericEntityField();

  function toggleValue() {
    const newToggleValue = !fieldValue;
    setFieldValue(newToggleValue);

    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newToggleValue,
      );
    }
  }

  return (
    <StyledEditableBooleanFieldContainer onClick={toggleValue}>
      <StyledBooleanFieldIcon>
        {fieldValue ? (
          <IconCheck size={theme.icon.size.sm} />
        ) : (
          <IconX size={theme.icon.size.sm} />
        )}
      </StyledBooleanFieldIcon>
      <StyledEditableBooleanFieldValue>
        {fieldValue ? 'True' : 'False'}
      </StyledEditableBooleanFieldValue>
    </StyledEditableBooleanFieldContainer>
  );
}
