import {
  type AiEvaluationQuestionType,
  type AiModelEffort,
  type DataResidency,
} from 'twenty-shared/ai';

import { type AiModelBenchmark } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-benchmark.type';
import { type AiModelKind } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-model-kinds.const';
import { type LongContextCost } from 'src/engine/metadata-modules/ai/ai-models/types/long-context-cost.type';
import { type ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

export type GeneratedModel = {
  name: string;
  label: string;
  description?: string;
  // Absent means language, which is everything models.dev describes.
  kind?: AiModelKind;
  modelFamily?: ModelFamily;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
  longContextCost?: LongContextCost;
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  modalities?: string[];
  supportsReasoning?: boolean;
  efforts?: AiModelEffort[];
  dataResidency?: DataResidency;
  zeroDataRetention?: boolean;
  benchmark?: AiModelBenchmark;
  benchmarkByEffort?: Partial<Record<AiModelEffort, AiModelBenchmark>>;
  isDeprecated?: boolean;
  supportedQuestionTypes?: AiEvaluationQuestionType[];
  maxCriteriaPerQuestion?: number;
  maxScoreLevels?: number;
  medianLatencyMs?: number;
};
