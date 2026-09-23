import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { SettingsAgentEvalsTab } from '~/pages/settings/ai/components/SettingsAgentEvalsTab';

const runEvaluationInput = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [runEvaluationInput],
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

jest.mock('@/ui/layout/dialog/hooks/useDialog', () => ({
  useDialog: () => ({ openDialog: jest.fn() }),
}));

jest.mock('@/ui/layout/dialog/components/ConfirmationDialog', () => ({
  ConfirmationDialog: () => null,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <Provider store={createStore()}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  </I18nProvider>
);

it('closes the evaluation menu immediately after starting a run', async () => {
  const user = userEvent.setup();
  runEvaluationInput.mockReturnValue(new Promise<void>(() => {}));

  render(
    <SettingsAgentEvalsTab
      agentId="test-agent"
      evaluationInputs={['Find all customers in Paris']}
      onEvaluationInputsChange={jest.fn()}
    />,
    { wrapper: Wrapper },
  );

  const trigger = screen.getByRole('button', { name: 'More options' });
  await user.click(trigger);
  await user.click(screen.getByRole('menuitem', { name: 'Run' }));

  expect(runEvaluationInput).toHaveBeenCalledWith({
    variables: { agentId: 'test-agent', input: 'Find all customers in Paris' },
  });
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
});

it('keeps evaluation actions inaccessible when editing is disabled', async () => {
  const user = userEvent.setup();
  render(
    <SettingsAgentEvalsTab
      agentId="test-agent"
      evaluationInputs={['Find all customers in Paris']}
      onEvaluationInputsChange={jest.fn()}
      disabled
    />,
    { wrapper: Wrapper },
  );

  const trigger = screen.getByRole('button', { name: 'More options' });
  expect(trigger).toBeDisabled();
  await user.click(trigger);

  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
});
