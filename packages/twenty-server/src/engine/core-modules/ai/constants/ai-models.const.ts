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

export type SupportedFileType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'text/html'
  | 'text/csv'
  | 'application/json';

export interface AIModelConfig {
  modelId: ModelId;
  label: string;
  description: string;
  provider: ModelProvider;
  inputCostPer1kTokensInCents: number;
  outputCostPer1kTokensInCents: number;
  contextWindowTokens: number;
  maxOutputTokens: number;
  supportedFileTypes?: SupportedFileType[];
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
    description:
      'Most advanced multimodal model with strong reasoning, vision, and coding capabilities',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.25,
    outputCostPer1kTokensInCents: 1.0,
    contextWindowTokens: 128000,
    maxOutputTokens: 16384,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'gpt-4o-mini',
    label: 'GPT-4o Mini',
    description:
      'Fast and cost-efficient model for lightweight tasks and high-volume operations',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 0.015,
    outputCostPer1kTokensInCents: 0.06,
    contextWindowTokens: 128000,
    maxOutputTokens: 16384,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description:
      'Previous generation high-performance model with vision capabilities',
    provider: ModelProvider.OPENAI,
    inputCostPer1kTokensInCents: 1.0,
    outputCostPer1kTokensInCents: 3.0,
    contextWindowTokens: 128000,
    maxOutputTokens: 4096,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: false,
    },
  },
  {
    modelId: 'claude-opus-4-20250514',
    label: 'Claude Opus 4',
    description:
      'Most powerful Claude model with extended thinking for complex reasoning tasks',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 1.5,
    outputCostPer1kTokensInCents: 7.5,
    contextWindowTokens: 200000,
    maxOutputTokens: 8192,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
    ],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet 4',
    description:
      'Balanced model with strong performance and extended thinking capabilities',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    contextWindowTokens: 200000,
    maxOutputTokens: 8192,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
    ],
    doesSupportThinking: true,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'claude-3-5-haiku-20241022',
    label: 'Claude Haiku 3.5',
    description:
      'Fast and efficient model optimized for speed and cost-effectiveness',
    provider: ModelProvider.ANTHROPIC,
    inputCostPer1kTokensInCents: 0.08,
    outputCostPer1kTokensInCents: 0.4,
    contextWindowTokens: 200000,
    maxOutputTokens: 8192,
    supportedFileTypes: [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/html',
      'text/csv',
    ],
    doesSupportThinking: false,
    nativeCapabilities: {
      webSearch: true,
    },
  },
  {
    modelId: 'grok-3',
    label: 'Grok-3',
    description:
      'Advanced model with web and Twitter search, optimized for real-time information',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.3,
    outputCostPer1kTokensInCents: 1.5,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-3-mini',
    label: 'Grok-3 Mini',
    description:
      'Lightweight model with web and Twitter search for fast, cost-effective operations',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.03,
    outputCostPer1kTokensInCents: 0.05,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
  {
    modelId: 'grok-4',
    label: 'Grok-4',
    description:
      'Most capable Grok model with enhanced reasoning, web and Twitter search',
    provider: ModelProvider.XAI,
    inputCostPer1kTokensInCents: 0.5,
    outputCostPer1kTokensInCents: 2.5,
    contextWindowTokens: 131072,
    maxOutputTokens: 8192,
    supportedFileTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    nativeCapabilities: {
      webSearch: true,
      twitterSearch: true,
    },
  },
];
