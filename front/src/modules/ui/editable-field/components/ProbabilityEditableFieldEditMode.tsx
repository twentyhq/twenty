import { useContext, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';

import { EditableFieldDefinitionContext } from '../contexts/EditableFieldDefinitionContext';
import { EditableFieldEntityIdContext } from '../contexts/EditableFieldEntityIdContext';
import { useUpdateGenericEntityField } from '../hooks/useUpdateGenericEntityField';
import { genericEntityFieldFamilySelector } from '../states/selectors/genericEntityFieldFamilySelector';
import { FieldDefinition } from '../types/FieldDefinition';
import { FieldProbabilityMetadata } from '../types/FieldMetadata';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
`;

const StyledProgressBarItemContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledProgressBarItem = styled.div<{
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
}>`
  background-color: ${({ theme, isActive }) =>
    isActive
      ? theme.font.color.secondary
      : theme.background.transparent.medium};
  border-bottom-left-radius: ${({ theme, isFirst }) =>
    isFirst ? theme.border.radius.sm : theme.border.radius.xs};
  border-bottom-right-radius: ${({ theme, isLast }) =>
    isLast ? theme.border.radius.sm : theme.border.radius.xs};
  border-top-left-radius: ${({ theme, isFirst }) =>
    isFirst ? theme.border.radius.sm : theme.border.radius.xs};
  border-top-right-radius: ${({ theme, isLast }) =>
    isLast ? theme.border.radius.sm : theme.border.radius.xs};
  height: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(3)};
`;

const StyledProgressBarContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
`;

const StyledLabel = styled.div`
  width: ${({ theme }) => theme.spacing(12)};
`;

const PROBABILITY_VALUES = [
  { label: '0%', value: 0 },
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
];

export const ProbabilityEditableFieldEditMode = () => {
  const [nextProbabilityIndex, setNextProbabilityIndex] = useState<
    number | null
  >(null);
  const currentEditableFieldEntityId = useContext(EditableFieldEntityIdContext);
  const currentEditableFieldDefinition = useContext(
    EditableFieldDefinitionContext,
  ) as FieldDefinition<FieldProbabilityMetadata>;

  const [fieldValue, setFieldValue] = useRecoilState<number>(
    genericEntityFieldFamilySelector({
      entityId: currentEditableFieldEntityId ?? '',
      fieldName: currentEditableFieldDefinition
        ? currentEditableFieldDefinition.metadata.fieldName
        : '',
    }),
  );

  const { closeEditableField } = useEditableField();

  const updateField = useUpdateGenericEntityField();

  const probabilityIndex = Math.ceil(fieldValue / 25);

  const handleChange = (newValue: number) => {
    setFieldValue(newValue);
    if (currentEditableFieldEntityId && updateField) {
      updateField(
        currentEditableFieldEntityId,
        currentEditableFieldDefinition,
        newValue,
      );
    }
    closeEditableField();
  };

  return (
    <StyledContainer>
      <StyledLabel>
        {
          PROBABILITY_VALUES[
            nextProbabilityIndex || nextProbabilityIndex === 0
              ? nextProbabilityIndex
              : probabilityIndex
          ].label
        }
      </StyledLabel>
      <StyledProgressBarContainer>
        {PROBABILITY_VALUES.map((probability, i) => (
          <StyledProgressBarItemContainer
            key={i}
            onClick={() => handleChange(probability.value)}
            onMouseEnter={() => setNextProbabilityIndex(i)}
            onMouseLeave={() => setNextProbabilityIndex(null)}
          >
            <StyledProgressBarItem
              isActive={
                nextProbabilityIndex || nextProbabilityIndex === 0
                  ? i <= nextProbabilityIndex
                  : i <= probabilityIndex
              }
              key={probability.label}
              isFirst={i === 0}
              isLast={i === PROBABILITY_VALUES.length - 1}
            />
          </StyledProgressBarItemContainer>
        ))}
      </StyledProgressBarContainer>
    </StyledContainer>
  );
};
