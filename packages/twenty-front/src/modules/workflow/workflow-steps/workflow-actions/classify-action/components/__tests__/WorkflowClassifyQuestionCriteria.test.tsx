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
        criteria={[
          {
            id: 'lawyer',
            name: 'Lawyer',
            description: 'Advises clients on legal matters',
          },
        ]}
        variant="options"
        readonly={false}
        onChange={onChange}
      />,
    );
    expect(
      screen.getAllByPlaceholderText('When should this option be chosen?')[1],
    ).toBeVisible();
    expect(
      screen.getAllByRole('button', { name: 'Delete option' }).at(-1),
    ).toBeDisabled();
    const input = screen.getByDisplayValue('Lawyer');
    await user.clear(input);
    await user.type(input, 'Billing');
    expect(input).toHaveFocus();
    expect(screen.getAllByPlaceholderText('Engineer')).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'Billing' }),
    ]);
    expect(
      screen.queryByRole('button', { name: 'Add description' }),
    ).not.toBeInTheDocument();
    await user.clear(
      screen.getByDisplayValue('Advises clients on legal matters'),
    );
    await user.type(
      screen.getAllByPlaceholderText('When should this option be chosen?')[0],
      'Invoices',
    );
    expect(onChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'Billing', description: 'Invoices' }),
    ]);
    const deleteButtons = screen.getAllByRole('button', {
      name: 'Delete option',
    });
    expect(deleteButtons[1]).toBeDisabled();
    await user.click(deleteButtons[0]);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(
      screen.getAllByRole('button', { name: 'Delete option' }).at(-1),
    ).toBeDisabled();
    expect(screen.getAllByPlaceholderText('Engineer')).toHaveLength(1);
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
    await user.clear(screen.getByDisplayValue('Billing'));
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
          { id: 'low', name: 'Low', description: 'Unhappy with the service' },
        ]}
        variant="levels"
        maxCriteria={2}
        readonly={false}
        onChange={onChange}
      />,
    );
    expect(screen.getByDisplayValue('Low')).toBeVisible();
    expect(screen.getByDisplayValue('Unhappy with the service')).toBeVisible();
    await user.type(
      screen.getAllByPlaceholderText('Satisfied')[1],
      'Satisfied',
    );
    expect(
      screen.getAllByPlaceholderText('When should this level apply?'),
    ).toHaveLength(2);
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'low', name: 'Low', description: 'Unhappy with the service' },
      expect.objectContaining({
        name: 'Satisfied',
        description: '',
      }),
    ]);
    await user.type(
      screen.getAllByPlaceholderText('When should this level apply?')[1],
      'Happy with the service',
    );
    expect(onChange).toHaveBeenLastCalledWith([
      { id: 'low', name: 'Low', description: 'Unhappy with the service' },
      expect.objectContaining({
        name: 'Satisfied',
        description: 'Happy with the service',
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
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
