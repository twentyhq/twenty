import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { type WorkflowCronTrigger } from '@/workflow/types/Workflow';
import { WorkflowEditTriggerCronForm } from '@/workflow/workflow-trigger/components/WorkflowEditTriggerCronForm';

const buildTrigger = (pattern: string): WorkflowCronTrigger => ({
  name: 'On a schedule',
  type: 'CRON',
  settings: { pattern, outputSchema: {} },
});

const renderForm = (pattern: string) => {
  const onTriggerUpdate = jest.fn();

  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <WorkflowEditTriggerCronForm
          trigger={buildTrigger(pattern)}
          hasFooter={false}
          triggerOptions={{ onTriggerUpdate }}
        />
      </Provider>
    </I18nProvider>,
  );

  return { onTriggerUpdate };
};

describe('WorkflowEditTriggerCronForm', () => {
  it('opens a pattern the editor can show in its schedule mode', () => {
    renderForm('*/10 * * * *');

    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('opens any other pattern as a custom expression', () => {
    renderForm('0 9 * * 1-5');

    expect(screen.getByText('Cron (Custom)')).toBeInTheDocument();
  });

  it('saves a schedule change as its cron pattern', async () => {
    const user = userEvent.setup();
    const { onTriggerUpdate } = renderForm('*/10 * * * *');

    const minutesInput = screen.getByDisplayValue('10');
    await user.clear(minutesInput);
    await user.type(minutesInput, '15');

    await waitFor(() => {
      expect(onTriggerUpdate).toHaveBeenLastCalledWith(
        buildTrigger('*/15 * * * *'),
      );
    });
  });

  it('stays on the custom expression after switching to it', async () => {
    const user = userEvent.setup();
    const { onTriggerUpdate } = renderForm('*/10 * * * *');

    await user.click(screen.getByText('Minutes'));
    await user.click(await screen.findByText('Cron (Custom)'));

    expect(onTriggerUpdate).toHaveBeenLastCalledWith(
      buildTrigger('*/10 * * * *'),
    );
    expect(await screen.findByText('Expression')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
  });
});
