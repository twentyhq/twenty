import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconBolt,
  IconCoins,
  IconFileText,
  IconFlag,
  IconServer,
  IconTag,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { getDataResidencyDisplay } from '@/settings/admin-panel/ai/utils/getDataResidencyDisplay';
import { getModelIcon } from '@/settings/admin-panel/ai/utils/getModelIcon';
import { type ModelFamily } from '~/generated-metadata/graphql';
import { formatNumber } from '~/utils/format/formatNumber';

const StyledNameValue = styled.span`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const StyledHoverCardWrapper = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  overflow: hidden;
`;

type SettingsAdminAiModelHoverCardProps = {
  label: string;
  modelFamily?: ModelFamily | null;
  providerName?: string | null;
  providerLabel: string;
  contextWindowTokens?: number | null;
  maxOutputTokens?: number | null;
  inputCostPerMillionTokens?: number | null;
  outputCostPerMillionTokens?: number | null;
  dataResidency?: string | null;
};

const formatCost = (
  inputCost?: number | null,
  outputCost?: number | null,
): string => {
  if (inputCost == null && outputCost == null) {
    return '—';
  }

  const parts: string[] = [];

  if (inputCost != null) {
    parts.push(`$${inputCost} in`);
  }

  if (outputCost != null) {
    parts.push(`$${outputCost} out`);
  }

  return parts.join(' / ');
};

export const SettingsAdminAiModelHoverCard = ({
  label,
  modelFamily,
  providerName,
  providerLabel,
  contextWindowTokens,
  maxOutputTokens,
  inputCostPerMillionTokens,
  outputCostPerMillionTokens,
  dataResidency,
}: SettingsAdminAiModelHoverCardProps) => {
  const ModelIcon = getModelIcon(modelFamily, providerName);

  const items = [
    {
      Icon: IconTag,
      label: t`Name`,
      value: (
        <StyledNameValue>
          <ModelIcon size={14} />
          {label}
        </StyledNameValue>
      ),
    },
    {
      Icon: IconServer,
      label: t`Provider`,
      value: providerLabel || '—',
    },
    ...(inputCostPerMillionTokens != null || outputCostPerMillionTokens != null
      ? [
          {
            Icon: IconCoins,
            label: t`Cost / 1M`,
            value: formatCost(
              inputCostPerMillionTokens,
              outputCostPerMillionTokens,
            ),
          },
        ]
      : []),
    ...(contextWindowTokens != null
      ? [
          {
            Icon: IconFileText,
            label: t`Context`,
            value: `${formatNumber(contextWindowTokens, {
              abbreviate: true,
              decimals: 1,
            })} tokens`,
          },
        ]
      : []),
    ...(maxOutputTokens != null
      ? [
          {
            Icon: IconBolt,
            label: t`Max output`,
            value: `${formatNumber(maxOutputTokens, {
              abbreviate: true,
              decimals: 1,
            })} tokens`,
          },
        ]
      : []),
    ...(dataResidency
      ? [
          {
            Icon: IconFlag,
            label: t`Data residency`,
            value: getDataResidencyDisplay(dataResidency),
          },
        ]
      : []),
  ];

  return (
    <StyledHoverCardWrapper>
      <SettingsAdminTableCard
        rounded
        items={items}
        gridAutoColumns="120px 1fr"
      />
    </StyledHoverCardWrapper>
  );
};
