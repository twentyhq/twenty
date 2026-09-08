import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { isAutoSelectModelId } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAiModelHoverCard } from '@/settings/ai/components/SettingsAiModelHoverCard';
import { cloudModelsPreview } from '@/settings/ai/components/__stories__/cloudModelsPreview';
import { Select } from '@/ui/input/components/Select';
import { ModelFamily } from '~/generated-metadata/graphql';

const model = {
  modelId: 'openai/luna',
  label: 'Luna',
  providerLabel: 'OpenAI',
  modelFamily: ModelFamily.GPT,
  dataResidency: 'us',
  inputCostPerMillionTokens: 0.2,
  outputCostPerMillionTokens: 2,
  contextWindowTokens: 1_000_000,
  benchmark: {
    modelId: 'example-benchmark',
    modelName: 'Luna (max)',
    modelSlug: 'gpt-5-6-luna',
    outputTokensPerSecond: 84,
    intelligenceIndex: 62,
    costPerTask: 0.1678,
    intelligenceIndexVersion: 4.3,
    fetchedAt: '2026-09-08T12:00:00.000Z',
  },
};

const comparisonModels = [
  {
    ...model,
    modelId: 'comparison',
    inputCostPerMillionTokens: 2,
    outputCostPerMillionTokens: 10,
    contextWindowTokens: 1_050_000,
    benchmark: {
      ...model.benchmark,
      outputTokensPerSecond: 100,
      intelligenceIndex: 100,
      costPerTask: 1,
    },
  },
];

const meta: Meta<typeof SettingsAiModelHoverCard> = {
  title: 'Settings/AI/ModelHoverCard',
  component: SettingsAiModelHoverCard,
  decorators: [ComponentDecorator],
  args: { model, comparisonModels },
};

export default meta;
type Story = StoryObj<typeof SettingsAiModelHoverCard>;

export const Default: Story = {};
export const WithoutBenchmarks: Story = {
  args: { model: { ...model, benchmark: undefined } },
};
export const WithoutMetadata: Story = {
  args: { model: { modelId: 'custom', label: 'Custom model' } },
};

const Selector = () => {
  const [value, setValue] = useState(model.modelId);

  return (
    <Select
      dropdownId="benchmark-model-selector"
      value={value}
      onChange={setValue}
      options={[
        {
          value: model.modelId,
          label: model.label,
          hoverCardContent: (
            <SettingsAiModelHoverCard
              model={model}
              comparisonModels={comparisonModels}
            />
          ),
        },
        {
          value: 'custom',
          label: 'Custom model',
          hoverCardContent: (
            <SettingsAiModelHoverCard
              model={{ modelId: 'custom', label: 'Custom model' }}
            />
          ),
        },
      ]}
    />
  );
};

export const InSelector: Story = { render: Selector };

const StyledCloudCatalog = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(286px, 1fr));
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledCloudModel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCloudModelLabel = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCloudModelProvider = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

export const CloudCatalog: Story = {
  args: {
    comparisonModels: cloudModelsPreview.filter(
      (cloudModel) =>
        !cloudModel.isDeprecated && !isAutoSelectModelId(cloudModel.modelId),
    ),
  },
  parameters: {
    container: { width: 1220 },
    docs: {
      description: {
        story:
          'Cloud catalog with all non-deprecated models enabled. Adjust comparisonModels to preview a workspace subset.',
      },
    },
  },
  render: ({ comparisonModels = [] }) => (
    <StyledCloudCatalog>
      {comparisonModels.map((cloudModel) => (
        <StyledCloudModel key={cloudModel.modelId}>
          <StyledCloudModelLabel>{cloudModel.label}</StyledCloudModelLabel>
          <StyledCloudModelProvider>
            {cloudModel.providerLabel}
          </StyledCloudModelProvider>
          <SettingsAiModelHoverCard
            model={cloudModel}
            comparisonModels={comparisonModels}
          />
        </StyledCloudModel>
      ))}
    </StyledCloudCatalog>
  ),
};
