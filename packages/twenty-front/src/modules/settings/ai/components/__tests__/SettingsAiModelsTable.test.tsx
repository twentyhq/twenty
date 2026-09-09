import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import { SettingsAiModelsTable } from '@/settings/ai/components/SettingsAiModelsTable';

const model = {
  modelId: 'model',
  label: 'Model A',
  benchmark: {
    modelId: 'benchmark',
    modelName: 'Model A',
    modelSlug: 'model-a',
    intelligenceIndex: 60,
    intelligenceIndexVersion: 4.3,
    fetchedAt: '2026-09-08T12:00:00.000Z',
  },
};

it('keeps the attribution interactive and compares against models hidden by search', async () => {
  const user = userEvent.setup();
  const onToggle = jest.fn();
  render(
    <Provider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <SettingsAiModelsTable
          models={[model]}
          comparisonModels={[
            model,
            {
              ...model,
              modelId: 'other',
              label: 'Other',
              benchmark: { ...model.benchmark, intelligenceIndex: 40 },
            },
          ]}
          isChecked={() => true}
          onToggle={onToggle}
          anchorPrefix="test-model"
        />
      </I18nProvider>
    </Provider>,
  );
  await user.hover(screen.getByText('Model A'));
  const link = await screen.findByRole('link', {
    name: 'Data from Artificial Analysis',
  });
  await user.hover(link);
  expect(link).toBeInTheDocument();
  const card = screen.getByRole('tooltip');
  expect(
    within(card).getByText('Intelligence').parentElement?.parentElement,
  ).toHaveAccessibleDescription(
    '#1/2 · Artificial Analysis Intelligence Index',
  );
  expect(onToggle).not.toHaveBeenCalled();
  await user.unhover(link);
  await waitFor(() =>
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
  );
});
