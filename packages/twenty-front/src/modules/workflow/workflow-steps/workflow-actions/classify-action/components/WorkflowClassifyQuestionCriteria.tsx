import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { type WorkflowClassifyCriterion } from 'twenty-shared/workflow';
import { v4 } from 'uuid';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: end;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(0, 1fr) auto;

  & > :nth-child(2) {
    grid-column: 1;
    grid-row: 2;
  }

  & > button {
    grid-column: 2;
    grid-row: 1;
  }
`;

type WorkflowClassifyQuestionCriteriaProps = {
  criteria: WorkflowClassifyCriterion[];
  variant: 'options' | 'levels';
  readonly: boolean;
  maxCriteria?: number;
  onChange: (criteria: WorkflowClassifyCriterion[]) => void;
};

const createEmptyCriterion = (): WorkflowClassifyCriterion => ({
  id: v4(),
  name: '',
  description: '',
});

const hasContent = (criterion: WorkflowClassifyCriterion) =>
  isNonEmptyString(criterion.name.trim()) ||
  isNonEmptyString(criterion.description?.trim());

export const WorkflowClassifyQuestionCriteria = ({
  criteria,
  variant,
  readonly,
  maxCriteria,
  onChange,
}: WorkflowClassifyQuestionCriteriaProps) => {
  const { t } = useLingui();
  const [rows, setRows] = useState(() => [
    ...criteria.filter(hasContent),
    createEmptyCriterion(),
  ]);

  const updateRows = (updatedRows: WorkflowClassifyCriterion[]) => {
    const filledRows = updatedRows.filter(hasContent);
    const emptyRow = updatedRows.find((row) => !hasContent(row));
    setRows([...filledRows, emptyRow ?? createEmptyCriterion()]);
    onChange(filledRows);
  };

  const changeCriterion = (
    id: string,
    update: Partial<WorkflowClassifyCriterion>,
  ) => {
    updateRows(
      rows.map((row) => (row.id === id ? { ...row, ...update } : row)),
    );
  };

  const visibleRows = readonly
    ? criteria
    : rows.filter(
        (row, index) => hasContent(row) || index < (maxCriteria ?? Infinity),
      );

  return (
    <StyledContainer>
      {visibleRows.map((criterion, index) => (
        <StyledRow key={criterion.id}>
          <FormTextFieldInput
            label={
              variant === 'options'
                ? t`Option ${index + 1}`
                : t`Level ${index + 1}`
            }
            defaultValue={criterion.name}
            placeholder={variant === 'options' ? t`Engineer` : t`Satisfied`}
            readonly={readonly}
            VariablePicker={WorkflowVariablePicker}
            onChange={(name) => changeCriterion(criterion.id, { name })}
          />
          <FormTextFieldInput
            defaultValue={criterion.description ?? ''}
            placeholder={
              variant === 'options'
                ? t`Designs and builds technical systems`
                : t`Expresses happiness with the service`
            }
            readonly={readonly}
            VariablePicker={WorkflowVariablePicker}
            onChange={(description) =>
              changeCriterion(criterion.id, { description })
            }
          />
          {!readonly && (
            <Button
              disabled={!hasContent(criterion)}
              startIcon={<IconTrash />}
              aria-label={
                variant === 'options' ? t`Delete option` : t`Delete level`
              }
              onClick={() =>
                updateRows(rows.filter((row) => row.id !== criterion.id))
              }
            />
          )}
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
