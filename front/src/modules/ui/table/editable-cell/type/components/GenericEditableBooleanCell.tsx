import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useUpdateGenericEntityField } from '@/ui/editable-field/hooks/useUpdateGenericEntityField';
import { entityFieldsFamilySelector } from '@/ui/field/states/selectors/entityFieldsFamilySelector';
import { FieldBooleanMetadata } from '@/ui/field/types/FieldMetadata';
import { BooleanInput } from '@/ui/input/components/BooleanInput';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';

import { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';
import { EditableCellDisplayContainer } from '../../components/EditableCellDisplayContainer';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldBooleanMetadata>;
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

export const GenericEditableBooleanCell = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const [fieldValue, setFieldValue] = useRecoilState<boolean>(
    entityFieldsFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.fieldName,
    }),
  );

  const updateField = useUpdateGenericEntityField();

  const handleClick = () => {
    const newValue = !fieldValue;

    try {
      setFieldValue(newValue);

      if (currentRowEntityId && updateField) {
        updateField(currentRowEntityId, viewFieldDefinition, newValue);
      }
    } catch (error) {
      console.warn(
        `In GenericEditableBooleanCellEditMode, Invalid value: ${newValue}, ${error}`,
      );
    }
  };

  return (
    <StyledCellBaseContainer>
      <EditableCellDisplayContainer onClick={handleClick}>
        <BooleanInput value={fieldValue} />
      </EditableCellDisplayContainer>
    </StyledCellBaseContainer>
  );
};
