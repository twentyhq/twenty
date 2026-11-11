import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useState } from 'react';
import { SegmentedControl } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { WorkflowStepConditionExpressionEditor } from '@/workflow/workflow-steps/conditions/components/WorkflowStepConditionExpressionEditor';

type ConditionMode = 'FILTERS' | 'EXPRESSION';

const StyledModeHint = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledExpression = styled.div`
  width: 100%;
`;

type WorkflowStepConditionInputProps = {
  instanceId: string;
  expressionLabel: string;
  condition: string | undefined;
  conditionFromFilter: string | undefined;
  hasFilterRows: boolean;
  readonly: boolean;
  onConditionSeed: (condition: string) => void;
  onConditionChange: (condition: string) => void;
  filters: ReactNode;
};

// Same rules as the trigger condition: each mode is offered only if it can show what the step runs
export const WorkflowStepConditionInput = ({
  instanceId,
  expressionLabel,
  condition,
  conditionFromFilter,
  hasFilterRows,
  readonly,
  onConditionSeed,
  onConditionChange,
  filters,
}: WorkflowStepConditionInputProps) => {
  const { t } = useLingui();

  const canShowAsFilters =
    !isNonEmptyString(condition) || condition === conditionFromFilter;
  const canShowAsExpression =
    !hasFilterRows || isNonEmptyString(conditionFromFilter);

  const [mode, setMode] = useState<ConditionMode>(
    canShowAsFilters ? 'FILTERS' : 'EXPRESSION',
  );

  const handleModeChange = (nextMode: ConditionMode) => {
    setMode(nextMode);

    if (
      readonly ||
      nextMode !== 'EXPRESSION' ||
      isNonEmptyString(condition) ||
      !isNonEmptyString(conditionFromFilter)
    ) {
      return;
    }

    onConditionSeed(conditionFromFilter);
  };

  return (
    <>
      {!readonly && (
        <SegmentedControl
          aria-label={t`Condition editor`}
          value={mode}
          onValueChange={handleModeChange}
          options={[
            {
              value: 'FILTERS',
              label: t`Filters`,
              disabled: !canShowAsFilters,
            },
            {
              value: 'EXPRESSION',
              label: t`Expression`,
              disabled: !canShowAsExpression,
            },
          ]}
        />
      )}
      {!readonly && !canShowAsFilters && (
        <StyledModeHint>{t`Clear the expression to edit it as filters.`}</StyledModeHint>
      )}
      {!readonly && !canShowAsExpression && (
        <StyledModeHint>{t`These filters can't be written as an expression.`}</StyledModeHint>
      )}
      {mode === 'FILTERS' ? (
        filters
      ) : (
        <StyledExpression>
          <InputLabel>{expressionLabel}</InputLabel>
          <WorkflowStepConditionExpressionEditor
            instanceId={instanceId}
            condition={condition ?? ''}
            onConditionChange={onConditionChange}
            readonly={readonly}
          />
        </StyledExpression>
      )}
    </>
  );
};
