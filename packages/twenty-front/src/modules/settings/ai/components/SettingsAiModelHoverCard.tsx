import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { Chip, ChipAccent, ChipSize, ChipVariant } from 'twenty-ui/components';
import {
  IconBolt,
  IconBuildingSkyscraper,
  IconFlag,
  IconTag,
  IconUsers,
  IconWindow,
  type IconComponent,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { getDataResidencyDisplay } from '@/settings/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { isDefined } from 'twenty-shared/utils';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledHoverCardWrapper = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  overflow: hidden;
  width: 320px;
`;

const StyledChipContainer = styled.div`
  max-width: 100%;
  overflow: hidden;
`;

const StyledValueText = styled.span`
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const formatCost = (
  inputCost?: number | null,
  outputCost?: number | null,
): string => {
  if (!isDefined(inputCost) && !isDefined(outputCost)) {
    return '—';
  }

  const parts: string[] = [];

  if (isDefined(inputCost)) {
    parts.push(`$${inputCost} in`);
  }

  if (isDefined(outputCost)) {
    parts.push(`$${outputCost} out`);
  }

  return parts.join(' / ');
};

type SettingsAiModelHoverCardProps = {
  model: AiModelSummary;
};

type HoverCardItem = {
  Icon: IconComponent;
  label: string;
  value: React.ReactNode;
};

export const SettingsAiModelHoverCard = ({
  model,
}: SettingsAiModelHoverCardProps) => {
  const { theme } = useContext(ThemeContext);

  const ModelIcon = getModelIcon(model.modelFamily, model.providerName);
  const providerLabel = model.providerLabel ?? model.providerName ?? '—';

  const items: HoverCardItem[] = [
    {
      Icon: IconTag,
      label: t`Name`,
      value: (
        <StyledChipContainer>
          <Chip
            size={ChipSize.Small}
            accent={ChipAccent.TextPrimary}
            variant={ChipVariant.Static}
            clickable={false}
            label={model.label}
            leftComponent={
              <ModelIcon
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.sm}
              />
            }
            rightComponent={null}
          />
        </StyledChipContainer>
      ),
    },
    {
      Icon: IconBuildingSkyscraper,
      label: t`Provider`,
      value: <StyledValueText>{providerLabel}</StyledValueText>,
    },
    ...(isDefined(model.inputCostPerMillionTokens) ||
    isDefined(model.outputCostPerMillionTokens)
      ? [
          {
            Icon: IconUsers,
            label: t`Cost per 1M tokens`,
            value: (
              <StyledValueText>
                {formatCost(
                  model.inputCostPerMillionTokens,
                  model.outputCostPerMillionTokens,
                )}
              </StyledValueText>
            ),
          },
        ]
      : []),
    ...(isDefined(model.contextWindowTokens)
      ? [
          {
            Icon: IconWindow,
            label: t`Context`,
            value: (
              <StyledValueText>
                {`${formatNumber(model.contextWindowTokens, {
                  abbreviate: true,
                  decimals: 1,
                })} tokens`}
              </StyledValueText>
            ),
          },
        ]
      : []),
    ...(isDefined(model.maxOutputTokens)
      ? [
          {
            Icon: IconBolt,
            label: t`Max output`,
            value: (
              <StyledValueText>
                {`${formatNumber(model.maxOutputTokens, {
                  abbreviate: true,
                  decimals: 1,
                })} tokens`}
              </StyledValueText>
            ),
          },
        ]
      : []),
    ...(isDefined(model.dataResidency)
      ? [
          {
            Icon: IconFlag,
            label: t`Data residency`,
            value: (
              <StyledValueText>
                {getDataResidencyDisplay(model.dataResidency)}
              </StyledValueText>
            ),
          },
        ]
      : []),
  ];

  return (
    <StyledHoverCardWrapper>
      <SettingsTableCard
        rounded
        items={items}
        gridAutoColumns={`${themeCssVariables.spacing[30]} 1fr`}
      />
    </StyledHoverCardWrapper>
  );
};
