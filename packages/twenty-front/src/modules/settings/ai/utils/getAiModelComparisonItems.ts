import { t } from '@lingui/core/macro';
import { isAutoSelectModelId } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconChartBar,
  IconCurrencyDollar,
  IconGauge,
} from 'twenty-ui/icon';
import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { getModelComparisonColor } from '@/settings/ai/utils/getModelComparisonColor';
import {
  isDisplayableNumber,
  formatCompactNumber,
  formatDollarPrice,
  getCostCategory,
  getModelComparisonScore,
  withModelRanking,
} from '@/settings/ai/utils/modelComparisonMetrics';
type ModelInformationItem = {
  comparisonLabel: string;
  label: string;
  maximumValue: number;
  rawValue: number;
  value: string;
  icon: typeof IconGauge;
  indicatorColor?: string;
  description?: string;
};

export const getAiModelComparisonItems = ({
  requestedModel,
  comparisonModels,
  isBillingEnabled,
}: {
  requestedModel: AiModelSummary;
  comparisonModels: AiModelSummary[];
  isBillingEnabled: boolean;
}) => {
  const availableModels = comparisonModels.filter(
    (entry) => !isAutoSelectModelId(entry.modelId) && !entry.isDeprecated,
  );
  const matchingModels = availableModels.filter(
    (entry) =>
      entry.label === requestedModel.label &&
      entry.providerName === requestedModel.providerName,
  );
  const model =
    isAutoSelectModelId(requestedModel.modelId) && matchingModels.length === 1
      ? matchingModels[0]
      : requestedModel;
  const benchmark = model.benchmark;
  const modelsToCompare =
    isAutoSelectModelId(model.modelId) || model.isDeprecated
      ? []
      : [
          ...new Map(
            [...availableModels, model].map((entry) => [entry.modelId, entry]),
          ).values(),
        ];

  const comparableSpeedValues = modelsToCompare
    .map((comparisonModel) => comparisonModel.benchmark?.outputTokensPerSecond)
    .filter(isDisplayableNumber);
  const comparableIntelligenceValues = modelsToCompare
    .filter(
      (comparisonModel) =>
        comparisonModel.benchmark?.intelligenceIndexVersion ===
        benchmark?.intelligenceIndexVersion,
    )
    .map((comparisonModel) => comparisonModel.benchmark?.intelligenceIndex)
    .filter(isDisplayableNumber);
  const comparableCostPerTaskValues = modelsToCompare
    .filter(
      (comparisonModel) =>
        comparisonModel.benchmark?.intelligenceIndexVersion ===
        benchmark?.intelligenceIndexVersion,
    )
    .map((comparisonModel) => comparisonModel.benchmark?.costPerTask)
    .filter(isDisplayableNumber);
  const comparableInputPricingValues = modelsToCompare
    .map((comparisonModel) => comparisonModel.inputCostPerMillionTokens)
    .filter(isDisplayableNumber);
  const comparableOutputPricingValues = modelsToCompare
    .map((comparisonModel) => comparisonModel.outputCostPerMillionTokens)
    .filter(isDisplayableNumber);
  const benchmarkItems: ModelInformationItem[] = [
    ...(isDisplayableNumber(benchmark?.intelligenceIndex)
      ? [
          {
            comparisonLabel: t`Intelligence compared with available models`,
            label: t`Intelligence`,
            maximumValue: 100,
            rawValue: getModelComparisonScore(
              benchmark.intelligenceIndex,
              comparableIntelligenceValues,
            ),
            value: formatCompactNumber(benchmark.intelligenceIndex, 1),
            icon: IconChartBar,
            indicatorColor: getModelComparisonColor(
              benchmark.intelligenceIndex,
              comparableIntelligenceValues,
            ),
            description: withModelRanking(
              t`Artificial Analysis Intelligence Index`,
              benchmark.intelligenceIndex,
              comparableIntelligenceValues,
            ),
          },
        ]
      : []),
    ...(isDisplayableNumber(benchmark?.outputTokensPerSecond)
      ? [
          {
            comparisonLabel: t`Speed compared with available models`,
            label: t`Speed`,
            maximumValue: 100,
            rawValue: getModelComparisonScore(
              benchmark.outputTokensPerSecond,
              comparableSpeedValues,
            ),
            value: formatCompactNumber(benchmark.outputTokensPerSecond, 0),
            icon: IconGauge,
            indicatorColor: getModelComparisonColor(
              benchmark.outputTokensPerSecond,
              comparableSpeedValues,
            ),
            description: withModelRanking(
              t`Output tokens per second`,
              benchmark.outputTokensPerSecond,
              comparableSpeedValues,
            ),
          },
        ]
      : []),
    ...(isDisplayableNumber(benchmark?.costPerTask) &&
    comparableCostPerTaskValues.length >= 2
      ? [
          {
            comparisonLabel: t`Cost index compared with available models`,
            label: t`Cost index`,
            maximumValue: 100,
            rawValue: getModelComparisonScore(
              benchmark.costPerTask,
              comparableCostPerTaskValues,
              true,
            ),
            value: getCostCategory(
              benchmark.costPerTask,
              comparableCostPerTaskValues,
            ),
            icon: IconCurrencyDollar,
            indicatorColor: getModelComparisonColor(
              benchmark.costPerTask,
              comparableCostPerTaskValues,
              true,
            ),
            description: withModelRanking(
              t`Relative cost across available models`,
              benchmark.costPerTask,
              comparableCostPerTaskValues,
              true,
            ),
          },
        ]
      : []),
  ];
  const pricingItems: ModelInformationItem[] = [
    ...(isBillingEnabled && isDisplayableNumber(model.inputCostPerMillionTokens)
      ? [
          {
            comparisonLabel: t`Input pricing compared with available models`,
            indicatorColor: getModelComparisonColor(
              model.inputCostPerMillionTokens,
              comparableInputPricingValues,
              true,
            ),
            label: t`Input cost`,
            maximumValue: 100,
            rawValue: getModelComparisonScore(
              model.inputCostPerMillionTokens,
              comparableInputPricingValues,
              true,
            ),
            value: formatDollarPrice(model.inputCostPerMillionTokens),
            icon: IconArrowDown,
            description: withModelRanking(
              t`Price per million input tokens billed with Twenty credits`,
              model.inputCostPerMillionTokens,
              comparableInputPricingValues,
              true,
            ),
          },
        ]
      : []),
    ...(isBillingEnabled &&
    isDisplayableNumber(model.outputCostPerMillionTokens)
      ? [
          {
            comparisonLabel: t`Output pricing compared with available models`,
            indicatorColor: getModelComparisonColor(
              model.outputCostPerMillionTokens,
              comparableOutputPricingValues,
              true,
            ),
            label: t`Output cost`,
            maximumValue: 100,
            rawValue: getModelComparisonScore(
              model.outputCostPerMillionTokens,
              comparableOutputPricingValues,
              true,
            ),
            value: formatDollarPrice(model.outputCostPerMillionTokens),
            icon: IconArrowUp,
            description: withModelRanking(
              t`Price per million output tokens billed with Twenty credits`,
              model.outputCostPerMillionTokens,
              comparableOutputPricingValues,
              true,
            ),
          },
        ]
      : []),
  ];

  return { model, benchmark, benchmarkItems, pricingItems };
};
