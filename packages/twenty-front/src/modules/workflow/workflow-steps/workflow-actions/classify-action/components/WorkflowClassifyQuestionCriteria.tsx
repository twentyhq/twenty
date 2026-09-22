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

const StyledCriterion = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNameRow = styled.div`
  align-items: end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledGrowingField = styled.div`
  flex: 1;
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
  const [emptyCriterion, setEmptyCriterion] = useState(createEmptyCriterion);

  const changeCriterion = (
    id: string,
    update: Partial<WorkflowClassifyCriterion>,
  ) => {
    if (id === emptyCriterion.id) {
      const criterion = { ...emptyCriterion, ...update };

      if (hasContent(criterion)) {
        setEmptyCriterion(createEmptyCriterion());
        onChange([...criteria, criterion]);
      }

      return;
    }

    onChange(
      criteria.map((criterion) =>
        criterion.id === id ? { ...criterion, ...update } : criterion,
      ),
    );
  };

  const visibleRows =
    readonly || criteria.length >= (maxCriteria ?? Infinity)
      ? criteria
      : [...criteria, emptyCriterion];

  return (
    <StyledContainer>
      {visibleRows.map((criterion, index) => (
        <StyledCriterion key={criterion.id}>
          <StyledNameRow>
            <StyledGrowingField>
              <FormTextFieldInput
                label={
                  variant === 'options'
                    ? t`Option ${index + 1} name`
                    : t`Level ${index + 1} name`
                }
                defaultValue={criterion.name}
                placeholder={variant === 'options' ? t`Engineer` : t`Satisfied`}
                readonly={readonly}
                onChange={(name) => changeCriterion(criterion.id, { name })}
              />
            </StyledGrowingField>
            {!readonly && (
              <Button
                disabled={criterion.id === emptyCriterion.id}
                startIcon={<IconTrash />}
                aria-label={
                  variant === 'options' ? t`Delete option` : t`Delete level`
                }
                onClick={() =>
                  onChange(criteria.filter((row) => row.id !== criterion.id))
                }
              />
            )}
          </StyledNameRow>
          <FormTextFieldInput
            label={
              variant === 'options' ? t`Description (optional)` : t`Description`
            }
            defaultValue={criterion.description ?? ''}
            placeholder={
              variant === 'options'
                ? t`When should this option be chosen?`
                : t`When should this level apply?`
            }
            readonly={readonly}
            VariablePicker={WorkflowVariablePicker}
            onChange={(description) =>
              changeCriterion(criterion.id, { description })
            }
          />
        </StyledCriterion>
      ))}
    </StyledContainer>
  );
};
