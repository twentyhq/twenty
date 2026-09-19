import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type WorkflowClassifyCriterion } from 'twenty-shared/workflow';
import { IconPlus, IconTrash } from 'twenty-ui/icon';
import { Button, InputLabel } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCriterionRow = styled.div<{ readonly: boolean }>`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: ${({ readonly }) =>
    readonly
      ? 'minmax(0, 1fr) minmax(0, 2fr)'
      : `minmax(0, 1fr) minmax(0, 2fr) ${themeCssVariables.spacing[8]}`};
`;

type WorkflowClassifyQuestionCriteriaProps = {
  criteria: WorkflowClassifyCriterion[];
  // Options are an unordered menu; levels are a ladder whose position is the
  // score. Same editor, different meaning, so the labels differ.
  variant: 'options' | 'levels';
  readonly: boolean;
  onChange: (criteria: WorkflowClassifyCriterion[]) => void;
};

export const WorkflowClassifyQuestionCriteria = ({
  criteria,
  variant,
  readonly,
  onChange,
}: WorkflowClassifyQuestionCriteriaProps) => {
  const { t } = useLingui();

  const handleCriterionChange = (
    index: number,
    field: 'name' | 'description',
    value: string,
  ) => {
    onChange(
      criteria.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, [field]: value } : criterion,
      ),
    );
  };

  const handleRemoveCriterion = (index: number) => {
    onChange(criteria.filter((_, criterionIndex) => criterionIndex !== index));
  };

  const handleAddCriterion = () => {
    onChange([...criteria, { name: '', description: '' }]);
  };

  return (
    <StyledContainer>
      <InputLabel>
        {variant === 'options' ? t`Options` : t`Levels, lowest first`}
      </InputLabel>

      {criteria.map((criterion, index) => (
        <StyledCriterionRow
          // Criteria are positional — a level's index is the score it means —
          // and have no stable id, so the row index is the identity.
          key={index}
          readonly={readonly}
        >
          <FormTextFieldInput
            defaultValue={criterion.name}
            placeholder={variant === 'options' ? t`Name` : t`Label`}
            readonly={readonly}
            onChange={(value) => handleCriterionChange(index, 'name', value)}
          />
          <FormTextFieldInput
            defaultValue={criterion.description ?? ''}
            placeholder={t`What this means`}
            readonly={readonly}
            VariablePicker={WorkflowVariablePicker}
            onChange={(value) =>
              handleCriterionChange(index, 'description', value)
            }
          />
          {!readonly && (
            <Button
              startIcon={<IconTrash />}
              aria-label={t`Delete`}
              onClick={() => handleRemoveCriterion(index)}
            />
          )}
        </StyledCriterionRow>
      ))}

      {!readonly && (
        <Button startIcon={<IconPlus />} onClick={handleAddCriterion}>
          {variant === 'options' ? t`Add option` : t`Add level`}
        </Button>
      )}
    </StyledContainer>
  );
};
