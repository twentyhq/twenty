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
            rawValue: getModelComparisonScore({
              value: benchmark.intelligenceIndex,
              comparisonValues: comparableIntelligenceValues,
            }),
            value: formatCompactNumber(benchmark.intelligenceIndex, 1),
            icon: IconChartBar,
            indicatorColor: getModelComparisonColor({
              value: benchmark.intelligenceIndex,
              comparisonValues: comparableIntelligenceValues,
            }),
            description: withModelRanking({
              description: t`Artificial Analysis Intelligence Index`,
              value: benchmark.intelligenceIndex,
              comparisonValues: comparableIntelligenceValues,
            }),
          },
        ]
      : []),
    ...(isDisplayableNumber(benchmark?.outputTokensPerSecond)
      ? [
          {
            comparisonLabel: t`Speed compared with available models`,
            label: t`Speed`,
            maximumValue: 100,
            rawValue: getModelComparisonScore({
              value: benchmark.outputTokensPerSecond,
              comparisonValues: comparableSpeedValues,
            }),
            value: formatCompactNumber(benchmark.outputTokensPerSecond, 0),
            icon: IconGauge,
            indicatorColor: getModelComparisonColor({
              value: benchmark.outputTokensPerSecond,
              comparisonValues: comparableSpeedValues,
            }),
            description: withModelRanking({
              description: t`Output tokens per second`,
              value: benchmark.outputTokensPerSecond,
              comparisonValues: comparableSpeedValues,
            }),
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
            rawValue: getModelComparisonScore({
              value: benchmark.costPerTask,
              comparisonValues: comparableCostPerTaskValues,
              lowerIsBetter: true,
            }),
            value: getCostCategory(
              benchmark.costPerTask,
              comparableCostPerTaskValues,
            ),
            icon: IconCurrencyDollar,
            indicatorColor: getModelComparisonColor({
              value: benchmark.costPerTask,
              comparisonValues: comparableCostPerTaskValues,
              lowerIsBetter: true,
            }),
            description: withModelRanking({
              description: t`Relative cost across available models`,
              value: benchmark.costPerTask,
              comparisonValues: comparableCostPerTaskValues,
              lowerIsBetter: true,
            }),
          },
        ]
      : []),
  ];
  const pricingItems: ModelInformationItem[] = [
    ...(isBillingEnabled && isDisplayableNumber(model.inputCostPerMillionTokens)
      ? [
          {
            comparisonLabel: t`Input pricing compared with available models`,
            indicatorColor: getModelComparisonColor({
              value: model.inputCostPerMillionTokens,
              comparisonValues: comparableInputPricingValues,
              lowerIsBetter: true,
            }),
            label: t`Input cost`,
            maximumValue: 100,
            rawValue: getModelComparisonScore({
              value: model.inputCostPerMillionTokens,
              comparisonValues: comparableInputPricingValues,
              lowerIsBetter: true,
            }),
            value: formatDollarPrice(model.inputCostPerMillionTokens),
            icon: IconArrowDown,
            description: withModelRanking({
              description: t`Price per million input tokens billed with Twenty credits`,
              value: model.inputCostPerMillionTokens,
              comparisonValues: comparableInputPricingValues,
              lowerIsBetter: true,
            }),
          },
        ]
      : []),
    ...(isBillingEnabled &&
    isDisplayableNumber(model.outputCostPerMillionTokens)
      ? [
          {
            comparisonLabel: t`Output pricing compared with available models`,
            indicatorColor: getModelComparisonColor({
              value: model.outputCostPerMillionTokens,
              comparisonValues: comparableOutputPricingValues,
              lowerIsBetter: true,
            }),
            label: t`Output cost`,
            maximumValue: 100,
            rawValue: getModelComparisonScore({
              value: model.outputCostPerMillionTokens,
              comparisonValues: comparableOutputPricingValues,
              lowerIsBetter: true,
            }),
            value: formatDollarPrice(model.outputCostPerMillionTokens),
            icon: IconArrowUp,
            description: withModelRanking({
              description: t`Price per million output tokens billed with Twenty credits`,
              value: model.outputCostPerMillionTokens,
              comparisonValues: comparableOutputPricingValues,
              lowerIsBetter: true,
            }),
          },
        ]
      : []),
  ];

  return { model, benchmark, benchmarkItems, pricingItems };
};
