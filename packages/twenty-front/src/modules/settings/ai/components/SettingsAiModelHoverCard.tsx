import { useId } from 'react';
import { AppTooltip } from 'twenty-ui/surfaces';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAiModelComparisonBar } from '@/settings/ai/components/SettingsAiModelComparisonBar';
import { SettingsAiModelInformation } from '@/settings/ai/components/SettingsAiModelInformation';
import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { getAiModelComparisonItems } from '@/settings/ai/utils/getAiModelComparisonItems';
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

type SettingsAiModelHoverCardProps = {
  comparisonModels?: AiModelSummary[];
  model: AiModelSummary;
};

export const SettingsAiModelHoverCard = ({
  comparisonModels = [],
  model: requestedModel,
}: SettingsAiModelHoverCardProps) => {
  const tooltipId = useId().replace(/:/g, '');
  const billing = useAtomStateValue(billingState);
  const isBillingEnabled = billing?.isBillingEnabled ?? false;
  const { model, benchmark, benchmarkItems, pricingItems } =
    getAiModelComparisonItems(
      requestedModel,
      comparisonModels,
      isBillingEnabled,
    );
  const renderItem = (
    item: ReturnType<
      typeof getAiModelComparisonItems
    >['benchmarkItems'][number],
  ) => {
    const anchorId = `${tooltipId}-${item.label.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    const Icon = item.icon;

    return (
      <StyledItem
        id={anchorId}
        key={item.label}
        aria-describedby={
          isDefined(item.description) ? `${anchorId}-description` : undefined
        }
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
          <span id={`${anchorId}-description`} hidden>
            {item.description}
          </span>
        )}
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
        {benchmarkItems.length > 0 && isDefined(benchmark) && (
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
