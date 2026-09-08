import { useId } from 'react';
import { AppTooltip } from 'twenty-ui/surfaces';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isAutoSelectModelId, isDefined } from 'twenty-shared/utils';
import {
  IconArrowDown,
  IconArrowUp,
  IconChartBar,
  IconCurrencyDollar,
  IconGauge,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAiModelComparisonBar } from '@/settings/ai/components/SettingsAiModelComparisonBar';
import { SettingsAiModelInformation } from '@/settings/ai/components/SettingsAiModelInformation';
import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { getModelComparisonColor } from '@/settings/ai/utils/getModelComparisonColor';
import { formatNumber } from '~/utils/format/formatNumber';
import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHoverCardWrapper = styled.div`
  backdrop-filter: blur(${themeCssVariables.blur.strong});
  background: ${themeCssVariables.background.transparent.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[2]};
  width: 286px;
`;

const StyledBody = styled.div`
  width: 100%;
`;

const StyledItem = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[6]};
  min-width: 0;
  width: 100%;

  & + & {
    margin-top: ${themeCssVariables.spacing[2]};
  }
`;

const StyledItemHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  width: 100%;
`;

const StyledItemValue = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAttribution = styled.a`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${themeCssVariables.spacing[6]};
  justify-content: flex-end;
  line-height: 1.4;
  margin-top: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
  text-align: right;
  text-decoration: none;

  &:hover {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

const isDisplayableNumber = (
  value: number | null | undefined,
): value is number => isDefined(value) && Number.isFinite(value) && value >= 0;

const formatCompactNumber = (value: number, decimals: number): string =>
  formatNumber(value, { abbreviate: true, decimals }).replace(/k$/, 'K');

const formatDollarPrice = (dollars: number): string => {
  if (dollars === 0) {
    return '$0';
  }

  if (Math.abs(dollars) < 0.01) {
    return `$${dollars.toFixed(4)}`;
  }

  return `$${formatNumber(dollars, { decimals: 2 })}`;
};

const getCostCategory = (cost: number, comparisonCosts: number[]): string => {
  if (comparisonCosts.length < 2) {
    return t`Medium`;
  }

  const lowerCostCount = comparisonCosts.filter(
    (comparisonCost) => comparisonCost < cost,
  ).length;
  const equalCostCount = comparisonCosts.filter(
    (comparisonCost) => comparisonCost === cost,
  ).length;
  const percentile =
    ((lowerCostCount + (equalCostCount - 1) / 2) /
      (comparisonCosts.length - 1)) *
    100;

  if (percentile < 20) {
    return t`Very low`;
  }

  if (percentile < 40) {
    return t`Low`;
  }

  if (percentile < 60) {
    return t`Medium`;
  }

  if (percentile < 80) {
    return t`High`;
  }

  return t`Very high`;
};

const getModelComparisonScore = (
  value: number,
  comparisonValues: number[],
  lowerIsBetter = false,
): number => {
  if (comparisonValues.length < 2) {
    return 50;
  }

  const lowerValueCount = comparisonValues.filter(
    (comparisonValue) => comparisonValue < value,
  ).length;
  const equalValueCount = comparisonValues.filter(
    (comparisonValue) => comparisonValue === value,
  ).length;
  const percentile =
    (lowerValueCount + (equalValueCount - 1) / 2) /
    (comparisonValues.length - 1);

  return Math.max((lowerIsBetter ? 1 - percentile : percentile) * 100, 8);
};

const withModelRanking = (
  description: string,
  value: number,
  comparisonValues: number[],
  lowerIsBetter = false,
): string => {
  if (comparisonValues.length < 2) {
    return description;
  }

  const rank =
    comparisonValues.filter((comparisonValue) =>
      lowerIsBetter ? comparisonValue < value : comparisonValue > value,
    ).length + 1;
  const total = comparisonValues.length;
  const ranking = `#${rank}/${total}`;

  return `${ranking} · ${description}`;
};

type SettingsAiModelHoverCardProps = {
  comparisonModels?: AiModelSummary[];
  model: AiModelSummary;
};

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

export const SettingsAiModelHoverCard = ({
  comparisonModels = [],
  model: requestedModel,
}: SettingsAiModelHoverCardProps) => {
  const tooltipId = useId().replace(/:/g, '');
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
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
  ];
  const pricingItems: ModelInformationItem[] = [
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
  const renderItem = (item: ModelInformationItem) => {
    const anchorId = `${tooltipId}-${item.label.replace(/\s/g, '-')}`;

    const Icon = item.icon;

    return (
      <StyledItem
        id={anchorId}
        key={item.label}
        tabIndex={isDefined(item.description) ? 0 : undefined}
      >
        <StyledItemHeader>
          <Icon size={14} />
          <StyledLabel>{item.label}</StyledLabel>
        </StyledItemHeader>
        <StyledItemValue>
          <StyledValue>{item.value}</StyledValue>
          <SettingsAiModelComparisonBar
            ariaLabel={item.comparisonLabel}
            color={item.indicatorColor}
            maximumValue={item.maximumValue}
            value={item.rawValue}
          />
        </StyledItemValue>
        {isDefined(item.description) && (
          <AppTooltip
            anchorSelect={`#${anchorId}`}
            title={item.description}
            place="top"
          />
        )}
      </StyledItem>
    );
  };

  return (
    <StyledHoverCardWrapper>
      <StyledBody>
        {benchmarkItems.map(renderItem)}
        {pricingItems.map(renderItem)}
        <SettingsAiModelInformation model={model} />
        {benchmarkItems.length + pricingItems.length > 0 &&
          isDefined(benchmark) && (
            <StyledAttribution
              href={`https://artificialanalysis.ai/models/${encodeURIComponent(benchmark.modelSlug)}`}
              target="_blank"
              rel="noreferrer"
            >
              {t`Data from Artificial Analysis`}
            </StyledAttribution>
          )}
      </StyledBody>
    </StyledHoverCardWrapper>
  );
};
