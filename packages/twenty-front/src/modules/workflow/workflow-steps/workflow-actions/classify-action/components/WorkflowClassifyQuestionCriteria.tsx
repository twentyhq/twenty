import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { type WorkflowClassifyCriterion } from 'twenty-shared/workflow';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { Button, InputLabel } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActionSlot = styled.div`
  flex: 0 0 ${themeCssVariables.spacing[8]};
`;

const StyledFields = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
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
  const [rows, setRows] = useState(() => [...criteria, createEmptyCriterion()]);

  const updateRows = (updatedRows: WorkflowClassifyCriterion[]) => {
    const filledRows = updatedRows.filter(hasContent);
    const trailingRow = updatedRows[updatedRows.length - 1];
    setRows([
      ...updatedRows,
      ...(isDefined(trailingRow) && !hasContent(trailingRow)
        ? []
        : [createEmptyCriterion()]),
    ]);
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
      <InputLabel>
        {variant === 'options' ? t`Options` : t`Levels, lowest first`}
      </InputLabel>
      {visibleRows.map((criterion, index) => (
        <StyledRow key={criterion.id}>
          {variant === 'levels' && <InputLabel>{index}</InputLabel>}
          <StyledFields>
            <FormTextFieldInput
              defaultValue={
                variant === 'levels'
                  ? criterion.description || criterion.name
                  : criterion.name
              }
              placeholder={
                variant === 'options'
                  ? t`e.g. Engineer`
                  : t`e.g. At least two years of regular React use`
              }
              readonly={readonly}
              VariablePicker={WorkflowVariablePicker}
              onChange={(value) =>
                changeCriterion(
                  criterion.id,
                  variant === 'levels'
                    ? { name: value, description: value }
                    : { name: value },
                )
              }
            />
            {variant === 'options' && (
              <FormTextFieldInput
                defaultValue={criterion.description ?? ''}
                placeholder={t`e.g. Designs, builds, or maintains software or technical systems.`}
                readonly={readonly}
                VariablePicker={WorkflowVariablePicker}
                onChange={(description) =>
                  changeCriterion(criterion.id, { description })
                }
              />
            )}
          </StyledFields>
          {!readonly && (
            <StyledActionSlot>
              {(hasContent(criterion) || index < visibleRows.length - 1) && (
                <Button
                  startIcon={<IconTrash />}
                  aria-label={
                    variant === 'options' ? t`Delete option` : t`Delete level`
                  }
                  onClick={() =>
                    updateRows(rows.filter((row) => row.id !== criterion.id))
                  }
                />
              )}
            </StyledActionSlot>
          )}
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
