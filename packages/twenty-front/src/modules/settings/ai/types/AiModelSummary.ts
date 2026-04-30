import { type ModelFamily } from '~/generated-metadata/graphql';

export type AiModelSummary = {
  modelId: string;
  label: string;
  modelFamily?: ModelFamily | null;
  providerName?: string | null;
  isDeprecated?: boolean | null;
  dataResidency?: string | null;
  providerLabel?: string | null;
  contextWindowTokens?: number | null;
  maxOutputTokens?: number | null;
  inputCostPerMillionTokens?: number | null;
  outputCostPerMillionTokens?: number | null;
};
