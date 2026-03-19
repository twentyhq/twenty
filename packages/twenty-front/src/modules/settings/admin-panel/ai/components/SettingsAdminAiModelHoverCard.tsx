import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  IconBolt,
  IconCoins,
  IconFileText,
  IconServer,
  IconTag,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { getModelIcon } from '~/pages/settings/ai/utils/getModelIcon';
import { getModelProviderLabel } from '~/pages/settings/ai/utils/getModelProviderLabel';

const StyledHoverCardWrapper = styled.div`
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  overflow: hidden;
`;

type SettingsAdminAiModelHoverCardProps = {
  label: string;
  modelFamily?: string | null;
  contextWindowTokens?: number | null;
  maxOutputTokens?: number | null;
  inputCostPerMillionTokens?: number | null;
  outputCostPerMillionTokens?: number | null;
};

const formatTokenCount = (tokens: number): string => {
  if (tokens >= 1_000_000) {
    return `${Math.round(tokens / 1_000_000)}M tokens`;
  }

  if (tokens >= 1_000) {
    return `${Math.round(tokens / 1_000)}k tokens`;
  }

  return `${tokens} tokens`;
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
  contextWindowTokens,
  maxOutputTokens,
  inputCostPerMillionTokens,
  outputCostPerMillionTokens,
}: SettingsAdminAiModelHoverCardProps) => {
  const ModelIcon = getModelIcon(modelFamily);
  const providerLabel = getModelProviderLabel(modelFamily);

  const items = [
    {
      Icon: IconTag,
      label: t`Name`,
      value: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ModelIcon size={14} />
          {label}
        </span>
      ),
    },
    {
      Icon: IconServer,
      label: t`Provider`,
      value: providerLabel ?? '—',
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
            value: formatTokenCount(contextWindowTokens),
          },
        ]
      : []),
    ...(maxOutputTokens != null
      ? [
          {
            Icon: IconBolt,
            label: t`Max output`,
            value: formatTokenCount(maxOutputTokens),
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
