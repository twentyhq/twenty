import {
  render as testingLibraryRender,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactElement } from 'react';
import { billingState } from '@/client-config/states/billingState';
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

const render = (
  element: ReactElement,
  isBillingEnabled: boolean | null = true,
) => {
  const store = createStore();
  store.set(
    billingState.atom,
    isBillingEnabled === null ? null : { isBillingEnabled, trialPeriods: [] },
  );
  return testingLibraryRender(<Provider store={store}>{element}</Provider>);
};

describe('SettingsAiModelHoverCard', () => {
  it.each([false, null])(
    'hides Twenty prices when billing is %s',
    (isBillingEnabled) => {
      render(
        <SettingsAiModelHoverCard
          model={{
            modelId: 'openai/luna',
            label: 'Luna',
            benchmark,
            inputCostPerMillionTokens: 0.2,
            outputCostPerMillionTokens: 1.2,
            contextWindowTokens: 1_000_000,
          }}
        />,
        isBillingEnabled,
      );
      expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
      expect(screen.queryByText('Output cost')).not.toBeInTheDocument();
      expect(screen.getByText('Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Context window')).toBeInTheDocument();
    },
  );
  it('shows Twenty costs and Artificial Analysis cost with attribution', async () => {
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
    expect(screen.getByText('Input cost')).toBeVisible();
    expect(screen.getByText('$0.2')).toBeVisible();
    expect(screen.getByText('Output cost')).toBeVisible();
    expect(screen.getByText('$1.2')).toBeVisible();
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

  it('describes input and output pricing separately', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'openai/luna',
          label: 'Luna',
          inputCostPerMillionTokens: 0.2,
          outputCostPerMillionTokens: 1.2,
        }}
      />,
    );

    await user.hover(screen.getByText('$0.2'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Price per million input tokens billed with Twenty credits',
    );
    unmount();
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'openai/luna',
          label: 'Luna',
          outputCostPerMillionTokens: 1.2,
        }}
      />,
    );
    await user.hover(screen.getByText('$1.2'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Price per million output tokens billed with Twenty credits',
    );
  });

  it('shows concise benchmark descriptions on focus', async () => {
    const user = userEvent.setup();
    render(
      <SettingsAiModelHoverCard
        model={{ modelId: 'openai/luna', label: 'Luna', benchmark }}
      />,
    );
    await user.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Artificial Analysis Intelligence Index',
    );
    await user.tab();
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
    expect(screen.getByText('Output cost')).toBeVisible();
    expect(screen.getByText('$1.25')).toBeVisible();
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
    expect(screen.getByText('$0')).toBeVisible();
    expect(screen.queryByText('Cost index')).not.toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeVisible();
    expect(screen.queryByText('Speed')).not.toBeInTheDocument();
    expect(screen.queryByText('Context')).not.toBeInTheDocument();
  });
});
