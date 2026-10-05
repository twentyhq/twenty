import { type ModelFamily } from '~/generated-metadata/graphql';

export type AiModelSummary = {
  modelId: string;
  label: string;
  // Absent on the lists that carry language models only.
  kind?: string | null;
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
