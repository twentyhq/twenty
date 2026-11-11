import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WorkflowStepConditionInput } from '@/workflow/workflow-steps/conditions/components/WorkflowStepConditionInput';

jest.mock(
  '@/workflow/workflow-steps/conditions/components/WorkflowStepConditionExpressionEditor',
  () => ({
    WorkflowStepConditionExpressionEditor: ({
      condition,
    }: {
      condition: string;
    }) => <div>{`Expression editor: ${condition}`}</div>,
  }),
);

const renderInput = ({
  condition,
  conditionFromFilter,
  hasFilterRows,
}: {
  condition?: string;
  conditionFromFilter?: string;
  hasFilterRows: boolean;
}) => {
  const onConditionSeed = jest.fn();

  render(
    <I18nProvider i18n={i18n}>
      <WorkflowStepConditionInput
        instanceId="filter-step"
        expressionLabel="Conditions"
        condition={condition}
        conditionFromFilter={conditionFromFilter}
        hasFilterRows={hasFilterRows}
        readonly={false}
        filters={<div>Filter rows</div>}
        onConditionSeed={onConditionSeed}
        onConditionChange={jest.fn()}
      />
    </I18nProvider>,
  );

  return { onConditionSeed };
};

describe('WorkflowStepConditionInput', () => {
  it('should open on the rows and seed the expression with their conversion', async () => {
    const condition = "{{trigger.name}} == 'Acme'";
    const { onConditionSeed } = renderInput({
      conditionFromFilter: condition,
      hasFilterRows: true,
    });

    expect(screen.getByText('Filter rows')).toBeInTheDocument();

    screen.getByRole('radio', { name: 'Filters' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onConditionSeed).toHaveBeenCalledWith(condition);
    expect(screen.getByText('Expression editor:')).toBeInTheDocument();
  });

  it('should reopen on an expression the rows do not produce, and keep the rows out of reach', () => {
    renderInput({ condition: '{{trigger.amount}} > 10', hasFilterRows: false });

    expect(
      screen.getByText('Expression editor: {{trigger.amount}} > 10'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Clear the expression to edit it as filters.'),
    ).toBeInTheDocument();
  });

  it('should keep rows that have no exact expression in filters mode', () => {
    renderInput({ hasFilterRows: true, conditionFromFilter: undefined });

    expect(screen.getByText('Filter rows')).toBeInTheDocument();
    expect(
      screen.getByText("These filters can't be written as an expression."),
    ).toBeInTheDocument();
  });
});
