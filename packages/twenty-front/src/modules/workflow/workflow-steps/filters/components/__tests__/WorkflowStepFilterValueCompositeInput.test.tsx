import { WorkflowStepFilterValueCompositeInput } from '@/workflow/workflow-steps/filters/components/WorkflowStepFilterValueCompositeInput';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewFilterOperand } from 'twenty-shared/types';

jest.mock(
  '@/workflow/workflow-variables/components/WorkflowVariablePicker',
  () => ({
    WorkflowVariablePicker: () => null,
  }),
);

it('preserves raw micros in workflow conditions', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  render(
    <I18nProvider i18n={i18n}>
      <WorkflowStepFilterValueCompositeInput
        stepFilter={{
          id: 'filter',
          type: 'CURRENCY',
          stepOutputKey: 'amount',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: '3210000',
          stepFilterGroupId: 'group',
          compositeFieldSubFieldName: 'amountMicros',
        }}
        onChange={onChange}
        onClear={() => {}}
      />
    </I18nProvider>,
  );
  const input = screen.getByRole('textbox');
  expect(input).toHaveValue('3210000');
  await user.clear(input);
  await user.type(input, '24');
  expect(onChange).toHaveBeenLastCalledWith(24);
});
