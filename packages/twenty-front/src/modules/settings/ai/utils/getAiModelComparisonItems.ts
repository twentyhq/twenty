import { t } from '@lingui/core/macro';
import { isAutoSelectModelId } from 'twenty-shared/utils';
import { IconChartBar, IconCurrencyDollar, IconGauge } from 'twenty-ui/icon';
import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { getModelComparisonColor } from '@/settings/ai/utils/getModelComparisonColor';
import { isDisplayableNumber } from '@/settings/ai/utils/isDisplayableNumber';
import { formatCompactNumber } from '@/settings/ai/utils/formatCompactNumber';
import { getCostCategory } from '@/settings/ai/utils/getCostCategory';
import { getModelComparisonScore } from '@/settings/ai/utils/getModelComparisonScore';
import { withModelRanking } from '@/settings/ai/utils/withModelRanking';
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
}: {
  requestedModel: AiModelSummary;
  comparisonModels: AiModelSummary[];
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
  return { model, benchmark, benchmarkItems };
};
