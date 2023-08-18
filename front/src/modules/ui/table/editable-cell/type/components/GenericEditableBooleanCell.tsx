import styled from '@emotion/styled';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useRecoilState } from 'recoil';

import {
  ViewFieldBooleanMetadata,
  ViewFieldDefinition,
} from '@/ui/editable-field/types/ViewField';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { useUpdateEntityField } from '@/ui/table/hooks/useUpdateEntityField';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import { EditableCellDisplayContainer } from '../../components/EditableCellContainer';

type OwnProps = {
  viewField: ViewFieldDefinition<ViewFieldBooleanMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  position: relative;
  user-select: none;
  width: 100%;
`;

const StyledCellBooleancontainer = styled.div`
  margin-left: 5px;
`;

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function GenericEditableBooleanCell({ viewField }: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const [fieldValue, setFieldValue] = useRecoilState<boolean>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewField.metadata.fieldName,
    }),
  );

  const updateField = useUpdateEntityField();

  function handleClick() {
    const newValue = !fieldValue;
    try {
      setFieldValue(newValue);

      if (currentRowEntityId && updateField) {
        updateField(currentRowEntityId, viewField, newValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableBooleanCellEditMode, Invalid value: ${newValue}, ${error}`,
      );
    }
  }

  return (
    <StyledCellBaseContainer>
      <EditableCellDisplayContainer onClick={handleClick}>
        {fieldValue ? <IconCheck /> : <IconX />}
        <StyledCellBooleancontainer>
          {capitalizeFirstLetter(fieldValue.toString())}
        </StyledCellBooleancontainer>
      </EditableCellDisplayContainer>
    </StyledCellBaseContainer>
  );
}
