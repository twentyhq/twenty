import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { convertDollarsToBillingCredits, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAiModelComparisonBar } from '@/settings/ai/components/SettingsAiModelComparisonBar';
import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledHoverCardWrapper = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  overflow: hidden;
  width: 300px;
`;

const StyledHeader = styled.div<{ $hasBody: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border-bottom: ${({ $hasBody }) =>
    $hasBody ? `1px solid ${themeCssVariables.border.color.light}` : 'none'};
  box-sizing: border-box;
  display: flex;
  height: ${themeCssVariables.spacing[10]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTitles = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing['0.5']};
  min-width: 0;
`;

const StyledModelName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1.4;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledProvider = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBody = styled.div`
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  width: 100%;

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
    margin-top: ${themeCssVariables.spacing[3]};
    padding-top: ${themeCssVariables.spacing[3]};
  }
`;

const StyledItemHeader = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 1;
  min-width: 0;
`;

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const isDisplayableNumber = (
  value: number | null | undefined,
): value is number => isDefined(value) && Number.isFinite(value) && value > 0;

const formatCompactNumber = (value: number, decimals: number): string =>
  formatNumber(value, { abbreviate: true, decimals }).replace(/k$/, 'K');

const formatCreditCost = (costInDollars: number): string =>
  t`${formatCompactNumber(
    convertDollarsToBillingCredits(costInDollars),
    2,
  )} credits / 1M tokens`;

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
};

type ComparableAiModelMetric =
  | 'inputCostPerMillionTokens'
  | 'outputCostPerMillionTokens'
  | 'contextWindowTokens';

const getMaximumMetricValue = (
  models: AiModelSummary[],
  metric: ComparableAiModelMetric,
): number =>
  models.reduce((maximumValue, model) => {
    const value = model[metric];

    return isDisplayableNumber(value)
      ? Math.max(maximumValue, value)
      : maximumValue;
  }, 0);

export const SettingsAiModelHoverCard = ({
  comparisonModels = [],
  model,
}: SettingsAiModelHoverCardProps) => {
  const providerLabel = model.providerLabel ?? model.providerName;
  const modelsToCompare = [...comparisonModels, model];

  const maximumInputCost = getMaximumMetricValue(
    modelsToCompare,
    'inputCostPerMillionTokens',
  );
  const maximumOutputCost = getMaximumMetricValue(
    modelsToCompare,
    'outputCostPerMillionTokens',
  );
  const maximumContextWindow = getMaximumMetricValue(
    modelsToCompare,
    'contextWindowTokens',
  );

  const items: ModelInformationItem[] = [
    ...(isDisplayableNumber(model.inputCostPerMillionTokens)
      ? [
          {
            comparisonLabel: t`Input cost compared with available models`,
            label: t`Input cost`,
            maximumValue: maximumInputCost,
            rawValue: model.inputCostPerMillionTokens,
            value: formatCreditCost(model.inputCostPerMillionTokens),
          },
        ]
      : []),
    ...(isDisplayableNumber(model.outputCostPerMillionTokens)
      ? [
          {
            comparisonLabel: t`Output cost compared with available models`,
            label: t`Output cost`,
            maximumValue: maximumOutputCost,
            rawValue: model.outputCostPerMillionTokens,
            value: formatCreditCost(model.outputCostPerMillionTokens),
          },
        ]
      : []),
    ...(isDisplayableNumber(model.contextWindowTokens)
      ? [
          {
            comparisonLabel: t`Context window compared with available models`,
            label: t`Context`,
            maximumValue: maximumContextWindow,
            rawValue: model.contextWindowTokens,
            value: formatCompactNumber(model.contextWindowTokens, 0),
          },
        ]
      : []),
  ];

  return (
    <StyledHoverCardWrapper>
      <StyledHeader $hasBody={items.length > 0}>
        <StyledTitles>
          <StyledModelName>{model.label}</StyledModelName>
          {isNonEmptyString(providerLabel) && (
            <StyledProvider>{providerLabel}</StyledProvider>
          )}
        </StyledTitles>
      </StyledHeader>
      {items.length > 0 && (
        <StyledBody>
          {items.map((item) => (
            <StyledItem key={item.label}>
              <StyledItemHeader>
                <StyledLabel>{item.label}</StyledLabel>
                <StyledValue>{item.value}</StyledValue>
              </StyledItemHeader>
              <SettingsAiModelComparisonBar
                ariaLabel={item.comparisonLabel}
                maximumValue={item.maximumValue}
                value={item.rawValue}
              />
            </StyledItem>
          ))}
        </StyledBody>
      )}
    </StyledHoverCardWrapper>
  );
};
