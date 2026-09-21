import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { type SelectOption } from 'twenty-ui/primitives/input';

import { aiEvaluationModelsState } from '@/client-config/states/aiEvaluationModelsState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { type WorkflowClassifyAction } from '@/workflow/types/Workflow';
import { WorkflowEditActionClassify } from '@/workflow/workflow-steps/workflow-actions/classify-action/components/WorkflowEditActionClassify';

jest.mock('@/workflow/workflow-steps/components/WorkflowStepFooter', () => ({
  WorkflowStepFooter: () => null,
}));
jest.mock('@/workflow/workflow-steps/components/WorkflowStepBody', () => ({
  WorkflowStepBody: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock(
  '@/workflow/workflow-variables/components/WorkflowVariablePicker',
  () => ({ WorkflowVariablePicker: () => null }),
);
jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormTextFieldInput',
  () => ({
    FormTextFieldInput: ({
      label,
      defaultValue,
      placeholder,
      readonly,
      onChange,
    }: {
      label?: string;
      defaultValue: string;
      placeholder: string;
      readonly: boolean;
      onChange: (value: string) => void;
    }) => (
      <label>
        {label}
        <input
          defaultValue={defaultValue}
          placeholder={placeholder}
          readOnly={readonly}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    ),
  }),
);
jest.mock('@/ui/input/components/Select', () => ({
  Select: ({
    label,
    options,
    value,
    description,
    onChange,
  }: {
    label: string;
    options: SelectOption<string>[];
    value: string;
    description: string;
    onChange: (value: string) => void;
  }) => (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      <span>{description}</span>
    </label>
  ),
}));

const EMPTY_ACTION: WorkflowClassifyAction = {
  id: '8711b76e-1b29-4147-8729-962e375d68f2',
  name: 'Classify',
  type: 'CLASSIFY',
  valid: false,
  settings: {
    input: { state: '', questions: [] },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
};

const renderEditor = (evaluationAvailable = false) => {
  const store = createStore();
  store.set(aiEvaluationModelsState.atom, [
    {
      modelId: 'typesafe-ai/jev',
      label: 'Jev',
      isAvailable: evaluationAvailable,
      supportedQuestionTypes: ['choice', 'score', 'boolean'],
    },
  ]);
  store.set(aiModelsState.atom, [
    { modelId: 'openai/example', label: 'Example LLM' },
  ]);
  const onUpdate = jest.fn();
  const Editor = () => {
    const [action, setAction] = useState(EMPTY_ACTION);
    return (
      <WorkflowEditActionClassify
        action={action}
        actionOptions={{
          onActionUpdate: (updated) => {
            onUpdate(updated);
            setAction(updated);
          },
        }}
      />
    );
  };
  render(
    <MemoryRouter>
      <Provider store={store}>
        <I18nProvider i18n={setupI18n({ locale: 'en', messages: { en: {} } })}>
          <Editor />
        </I18nProvider>
      </Provider>
    </MemoryRouter>,
  );
  return onUpdate;
};

describe('WorkflowEditActionClassify', () => {
  it('guides an empty form with job-profile placeholders without inserting sample data', async () => {
    const user = userEvent.setup();
    const onUpdate = renderEditor();
    expect(
      screen.queryByRole('button', { name: 'Use an example' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Alex is a software engineer/),
    ).toHaveValue('');
    expect(onUpdate).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(screen.getByPlaceholderText('profession')).toHaveValue('');
    expect(
      screen.getByPlaceholderText("What is this person's current profession?"),
    ).toHaveValue('');
    expect(screen.getAllByPlaceholderText('Engineer')[1]).toHaveValue('');
    expect(
      screen.getAllByPlaceholderText('When should this option be chosen?')[1],
    ).toHaveValue('');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Type' }),
      'score',
    );
    expect(screen.getByPlaceholderText('customer_satisfaction')).toBeVisible();
    expect(
      screen.getByPlaceholderText(/How satisfied is the customer/),
    ).toHaveValue('');
    expect(
      screen.getAllByPlaceholderText('When should this level apply?')[1],
    ).toHaveValue('');
    expect(screen.getByDisplayValue('Dissatisfied')).toBeVisible();
    expect(
      screen.getByDisplayValue('Expresses frustration or disappointment'),
    ).toBeVisible();
    await user.click(
      screen.getAllByRole('button', { name: 'Delete level' })[0],
    );
    expect(screen.queryByDisplayValue('Dissatisfied')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Satisfied')).toHaveValue('');
  });

  it('uses Jev without a model picker and offers probabilities', async () => {
    const user = userEvent.setup();
    renderEditor(true);
    expect(
      screen.queryByRole('combobox', { name: /Model/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add question' }));
    expect(
      screen.getByRole('option', { name: 'Estimate a probability' }),
    ).not.toBeDisabled();
  });
});
