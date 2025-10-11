export enum ModelProvider {
  NONE = 'none',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OPENAI_COMPATIBLE = 'open_ai_compatible',
  XAI = 'xai',
}

export type ModelId =
  | 'auto'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'claude-opus-4-20250514'
  | 'claude-sonnet-4-20250514'
  | 'claude-3-5-haiku-20241022'
  | 'grok-3'
  | 'grok-3-mini'
  | 'grok-4'
  | string; // Allow custom model names

export interface AIModelConfig {
  modelId: ModelId;
  label: string;
  provider: ModelProvider;
  inputCostPer1kTokensInCents: number;
  outputCostPer1kTokensInCents: number;
  doesSupportThinking?: boolean;
  nativeCapabilities?: {
    webSearch?: boolean;
    twitterSearch?: boolean;
  };
}

export const AI_MODELS: AIModelConfig[] = [
  {
    modelId: 'gpt-4o',
    label: 'GPT-4o',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.25,
    outputCostPer1kTokensInCents: 1.0,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.015,
    outputCostPer1kTokensInCents: 0.06,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 1.0,
    outputCostPer1kTokensInCents: 3.0,
    nativeCapabilities: {
      webSearch: false,
    },
  },
  {
    modelId: 'claude-opus-4-20250514',
    label: 'Claude Opus 4',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 1.5,
    outputCostPer1kTokensInCents: 7.5,
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet 4',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'claude-3-5-haiku-20241022',
    label: 'Claude Haiku 3.5',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.08,
    outputCostPer1kTokensInCents: 0.4,
    doesSupportThinking: false,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'grok-3',
    label: 'Grok-3',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-3-mini',
    label: 'Grok-3 Mini',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.03,
    outputCostPer1kTokensInCents: 0.05,
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-4',
    label: 'Grok-4',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.5,
    outputCostPer1kTokensInCents: 2.5,
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
];
