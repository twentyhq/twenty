export type AdminAiModelItem = {
  modelId: string;
  label: string;
  modelFamily?: string | null;
  provider: string;
  isAvailable: boolean;
  isAdminEnabled: boolean;
  deprecated?: boolean | null;
  isRecommended?: boolean | null;
  contextWindowTokens?: number | null;
  maxOutputTokens?: number | null;
  inputCostPerMillionTokens?: number | null;
  outputCostPerMillionTokens?: number | null;
  providerName?: string | null;
  dataResidency?: string | null;
};
