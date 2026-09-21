import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactElement } from 'react';
import { render as testingRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowClassifyQuestionCriteria } from '@/workflow/workflow-steps/workflow-actions/classify-action/components/WorkflowClassifyQuestionCriteria';

jest.mock(
  '@/workflow/workflow-variables/components/WorkflowVariablePicker',
  () => ({ WorkflowVariablePicker: () => null }),
);
jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormTextFieldInput',
  () => ({
    FormTextFieldInput: ({
      defaultValue,
      placeholder,
      readonly,
      onChange,
    }: {
      defaultValue: string;
      placeholder: string;
      readonly: boolean;
      onChange: (value: string) => void;
    }) => (
      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readonly}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  }),
);

const render = (element: ReactElement) =>
  testingRender(
    <I18nProvider i18n={setupI18n({ locale: 'en', messages: { en: {} } })}>
      {element}
    </I18nProvider>,
  );

describe('WorkflowClassifyQuestionCriteria', () => {
  it('adds a trailing row without losing focus or saving the blank row', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <WorkflowClassifyQuestionCriteria
        criteria={[]}
        variant="options"
        readonly={false}
        onChange={onChange}
      />,
    );
    const input = screen.getByPlaceholderText('Option');
    await user.type(input, 'Billing');
    expect(input).toHaveFocus();
    expect(screen.getAllByPlaceholderText('Option')).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'Billing' }),
    ]);
    await user.click(screen.getByRole('button', { name: 'Add description' }));
    await user.type(
      screen.getByPlaceholderText('When should this option be chosen?'),
      'Invoices',
    );
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'Billing', description: 'Invoices' }),
    ]);
    await user.click(screen.getByRole('button', { name: 'Delete option' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getAllByPlaceholderText('Option')).toHaveLength(1);
  });

  it('retains a partially filled option when its label is cleared', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <WorkflowClassifyQuestionCriteria
        criteria={[{ id: 'billing', name: 'Billing', description: 'Invoices' }]}
        variant="options"
        readonly={false}
        onChange={onChange}
      />,
    );
    await user.clear(screen.getAllByPlaceholderText('Option')[0]);
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'billing', name: '', description: 'Invoices' },
    ]);
  });

  it('preserves existing score descriptions and stops adding rows at the limit', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <WorkflowClassifyQuestionCriteria
        criteria={[
          { id: 'low', name: 'Low', description: 'No React experience' },
        ]}
        variant="levels"
        maxCriteria={2}
        readonly={false}
        onChange={onChange}
      />,
    );
    expect(screen.getByDisplayValue('No React experience')).toBeVisible();
    await user.type(
      screen.getAllByPlaceholderText('Describe this level')[1],
      'Experienced',
    );
    expect(screen.getAllByPlaceholderText('Describe this level')).toHaveLength(
      2,
    );
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'low', name: 'Low', description: 'No React experience' },
      expect.objectContaining({
        name: 'Experienced',
        description: 'Experienced',
      }),
    ]);
  });

  it('does not show a draft row or editing actions in read-only mode', () => {
    render(
      <WorkflowClassifyQuestionCriteria
        criteria={[{ id: 'billing', name: 'Billing' }]}
        variant="options"
        readonly
        onChange={jest.fn()}
      />,
    );
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
