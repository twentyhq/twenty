export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export interface AIModelConfig {
  modelId: string;
  displayName: string;
  provider: ModelProvider;
  inputCostPer1kTokensInCents: number;
  outputCostPer1kTokensInCents: number;
  isActive: boolean;
  isDefault: boolean;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    modelId: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.25,
    outputCostPer1kTokensInCents: 1.0,
    isActive: true,
    isDefault: true,
  },
  {
    modelId: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.015,
    outputCostPer1kTokensInCents: 0.06,
    isActive: true,
    isDefault: false,
  },
  {
    modelId: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 1.0,
    outputCostPer1kTokensInCents: 3.0,
    isActive: true,
    isDefault: false,
  },
  {
    modelId: 'claude-opus-4-20250514',
    displayName: 'Claude Opus 4',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 1.5,
    outputCostPer1kTokensInCents: 7.5,
    isActive: true,
    isDefault: false,
  },
  {
    modelId: 'claude-sonnet-4-20250514',
    displayName: 'Claude Sonnet 4',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    isActive: true,
    isDefault: false,
  },
  {
    modelId: 'claude-3-5-haiku-20241022',
    displayName: 'Claude Haiku 3.5',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.08,
    outputCostPer1kTokensInCents: 0.4,
    isActive: true,
    isDefault: false,
  },
];
