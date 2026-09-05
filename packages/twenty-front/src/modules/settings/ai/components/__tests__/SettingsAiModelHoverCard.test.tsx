import { render, screen } from '@testing-library/react';

import { SettingsAiModelHoverCard } from '@/settings/ai/components/SettingsAiModelHoverCard';

describe('SettingsAiModelHoverCard', () => {
  it('should display model information using billing credits', () => {
    render(
      <SettingsAiModelHoverCard
        comparisonModels={[
          {
            modelId: 'anthropic/claude-opus',
            label: 'Claude Opus',
            inputCostPerMillionTokens: 4,
            outputCostPerMillionTokens: 20,
            contextWindowTokens: 1_050_000,
          },
        ]}
        model={{
          modelId: 'openai/gpt-5.6-luna',
          label: 'GPT-5.6 Luna',
          providerLabel: 'Open AI',
          inputCostPerMillionTokens: 0.2,
          outputCostPerMillionTokens: 1.2,
          contextWindowTokens: 1_050_000,
          maxOutputTokens: 128_000,
          dataResidency: 'US',
        }}
      />,
    );

    expect(screen.getByText('GPT-5.6 Luna')).toBeVisible();
    expect(screen.getByText('Open AI')).toBeVisible();
    expect(screen.getByText('Input cost')).toBeVisible();
    expect(screen.getByText('200K credits / 1M tokens')).toBeVisible();
    expect(screen.getByText('Output cost')).toBeVisible();
    expect(screen.getByText('1.2M credits / 1M tokens')).toBeVisible();
    expect(screen.getByText('Context')).toBeVisible();
    expect(screen.getByText('1M')).toBeVisible();
    expect(
      screen.getByRole('progressbar', {
        name: 'Input cost compared with available models',
      }),
    ).toHaveAttribute('aria-valuenow', '24');
    expect(
      screen.getByRole('progressbar', {
        name: 'Output cost compared with available models',
      }),
    ).toHaveAttribute('aria-valuenow', '24.8');
    expect(
      screen.getByRole('progressbar', {
        name: 'Context window compared with available models',
      }),
    ).toHaveAttribute('aria-valuenow', '100');
    expect(screen.queryByText('Max output')).not.toBeInTheDocument();
    expect(screen.queryByText('Data residency')).not.toBeInTheDocument();
    expect(screen.queryByText('Speed')).not.toBeInTheDocument();
    expect(screen.queryByText('Intelligence')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Data from Artificial Analysis'),
    ).not.toBeInTheDocument();
  });

  it('should omit unavailable and non-positive metadata', () => {
    const { container } = render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'custom/model',
          label: 'Custom model',
          inputCostPerMillionTokens: 0,
          outputCostPerMillionTokens: null,
          contextWindowTokens: 0,
        }}
      />,
    );

    expect(screen.getByText('Custom model')).toBeVisible();
    expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
    expect(screen.queryByText('Output cost')).not.toBeInTheDocument();
    expect(screen.queryByText('Context')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent('undefined');
  });

  it('should preserve meaningful cost precision', () => {
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'provider/priced-model',
          label: 'Priced model',
          inputCostPerMillionTokens: 1.25,
        }}
      />,
    );

    expect(screen.getByText('1.25M credits / 1M tokens')).toBeVisible();
  });

  it('should display whichever metadata fields are available', () => {
    render(
      <SettingsAiModelHoverCard
        model={{
          modelId: 'provider/partial-model',
          label: 'Partial model',
          providerName: 'provider',
          outputCostPerMillionTokens: 0.04,
          contextWindowTokens: 128_000,
        }}
      />,
    );

    expect(screen.getByText('provider')).toBeVisible();
    expect(screen.queryByText('Input cost')).not.toBeInTheDocument();
    expect(screen.getByText('Output cost')).toBeVisible();
    expect(screen.getByText('40K credits / 1M tokens')).toBeVisible();
    expect(screen.getByText('128K')).toBeVisible();
  });
});
