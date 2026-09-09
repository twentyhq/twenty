import {
  render as testingLibraryRender,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactElement } from 'react';
import userEvent from '@testing-library/user-event';
import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';

import { SettingsAiModelHoverCard } from '@/settings/ai/components/SettingsAiModelHoverCard';

const benchmark = {
  modelId: 'benchmark-id',
  modelName: 'Luna (max)',
  modelSlug: 'luna',
  outputTokensPerSecond: 84,
  intelligenceIndex: 62,
  costPerTask: 0.1678,
  intelligenceIndexVersion: 4.3,
  fetchedAt: '2026-09-08T12:00:00.000Z',
};

const render = (element: ReactElement) => {
  const store = createStore();
  return testingLibraryRender(<Provider store={store}>{element}</Provider>);
};

describe('SettingsAiModelHoverCard', () => {
  it('does not display or attribute model token prices', () => {
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'empty',
          label: 'Empty benchmark',
          benchmark: {
            ...benchmark,
            intelligenceIndex: undefined,
            outputTokensPerSecond: undefined,
            costPerTask: undefined,
          },
          inputCostPerMillionTokens: 1,
        }}
      />,
    );
    expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Data from Artificial Analysis'),
    ).not.toBeInTheDocument();
  });

  it('attributes a displayed cost index even without speed or intelligence', () => {
    const costOnlyBenchmark = {
      ...benchmark,
      intelligenceIndex: undefined,
      outputTokensPerSecond: undefined,
    };
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'cost-only',
          label: 'Cost only',
          benchmark: costOnlyBenchmark,
        }}
        comparisonModels={[
          {
            modelId: 'other',
            label: 'Other',
            benchmark: { ...costOnlyBenchmark, costPerTask: 2 },
          },
        ]}
      />,
    );
    expect(screen.getByText('Cost index')).toBeInTheDocument();
    expect(
      screen.getByText('Data from Artificial Analysis'),
    ).toBeInTheDocument();
  });
  it('shows benchmark comparisons and model information', async () => {
    const user = userEvent.setup();
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'openai/luna',
          label: 'Luna',
          providerLabel: 'OpenAI',
          dataResidency: 'us',
          benchmark,
          inputCostPerMillionTokens: 0.2,
          outputCostPerMillionTokens: 1.2,
          contextWindowTokens: 1_000_000,
        }}
        comparisonModels={[
          {
            modelId: 'comparison/model',
            label: 'Comparison',
            benchmark: { ...benchmark, modelId: 'comparison', costPerTask: 1 },
          },
        ]}
      />,
    );

    expect(screen.getByText('84')).toBeVisible();
    expect(screen.getByText('62')).toBeVisible();
    expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
    expect(screen.queryByText('Output cost')).not.toBeInTheDocument();
    expect(screen.getByText('Cost index')).toBeVisible();
    expect(screen.getByText('Very low')).toBeVisible();
    expect(screen.getByText('1M')).toBeVisible();
    expect(screen.getByText('Context window')).toBeVisible();
    expect(screen.getByText('Server location')).toBeVisible();
    expect(screen.getByText('US')).toBeVisible();
    expect(screen.queryByText('Input modality')).not.toBeInTheDocument();
    expect(screen.queryByText('Output modality')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Data from Artificial Analysis' }),
    ).toHaveAttribute('href', 'https://artificialanalysis.ai/models/luna');
    await user.hover(screen.getByText('Cost index'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Relative cost across available models',
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('#1/2');
  });

  it('shows concise benchmark descriptions on focus', async () => {
    const user = userEvent.setup();
    render(
      <SettingsAiModelHoverCard
        model={{ modelId: 'openai/luna', label: 'Luna', benchmark }}
      />,
    );
    await user.tab();
    expect(document.activeElement).toHaveAccessibleDescription(
      'Artificial Analysis Intelligence Index',
    );
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Artificial Analysis Intelligence Index',
    );
    await user.tab();
    expect(document.activeElement).toHaveAccessibleDescription(
      'Output tokens per second',
    );
    await waitFor(() =>
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Output tokens per second',
      ),
    );
  });

  it('omits missing benchmarks without hiding available model metadata', () => {
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'custom/model',
          label: 'Custom',
          outputCostPerMillionTokens: 1.25,
          contextWindowTokens: 128_000,
        }}
      />,
    );
    expect(screen.queryByText('Output cost')).not.toBeInTheDocument();
    expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
    expect(screen.queryByText('Cost index')).not.toBeInTheDocument();
    expect(screen.getByText('128K')).toBeVisible();
    expect(screen.queryByText('Server location')).not.toBeInTheDocument();
    expect(screen.queryByText('Speed')).not.toBeInTheDocument();
    expect(screen.queryByText('Intelligence')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each(['openai/luna', AUTO_SELECT_SMART_MODEL_ID])(
    'uses the same ranking for a model and its default alias: %s',
    async (modelId) => {
      const user = userEvent.setup();
      const realModel = {
        modelId: 'openai/luna',
        label: 'Luna',
        providerName: 'openai',
        benchmark,
      };
      render(
        <SettingsAiModelHoverCard
          model={{ ...realModel, modelId }}
          comparisonModels={[
            realModel,
            { ...realModel, modelId: AUTO_SELECT_SMART_MODEL_ID },
            { ...realModel, modelId: 'retired', isDeprecated: true },
            {
              ...realModel,
              modelId: 'other',
              label: 'Other',
              benchmark: { ...benchmark, costPerTask: 1 },
            },
          ]}
        />,
      );
      await user.hover(screen.getByText('Cost index'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        '#1/2 · Relative cost across available models',
      );
    },
  );

  it('distinguishes zero prices and scores from unavailable metrics', () => {
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'custom/free',
          label: 'Free',
          inputCostPerMillionTokens: 0,
          outputCostPerMillionTokens: null,
          contextWindowTokens: 0,
          benchmark: {
            ...benchmark,
            intelligenceIndex: 0,
            costPerTask: 0,
            outputTokensPerSecond: null,
          },
        }}
      />,
    );
    expect(screen.getByText('0')).toBeVisible();
    expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
    expect(screen.queryByText('Cost index')).not.toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeVisible();
    expect(screen.queryByText('Speed')).not.toBeInTheDocument();
    expect(screen.queryByText('Context')).not.toBeInTheDocument();
  });
});
