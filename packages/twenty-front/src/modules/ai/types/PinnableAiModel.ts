import { type ModelFamily } from '~/generated-metadata/graphql';

export type PinnableAiModel = {
  modelId: string;
  label: string;
  isDeprecated?: boolean | null;
  dataResidency?: string | null;
  providerLabel?: string | null;
  providerName?: string | null;
  modelFamily?: ModelFamily | null;
  efforts?: string[] | null;
  effort?: string | null;
};
