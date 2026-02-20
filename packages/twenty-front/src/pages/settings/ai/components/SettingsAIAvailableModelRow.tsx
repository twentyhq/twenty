import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { IconRobot } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { type ClientAiModelConfig } from '~/generated-metadata/graphql';
import { PROVIDER_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

type SettingsAIAvailableModelRowProps = {
  model: ClientAiModelConfig;
  checked: boolean;
  onToggle: (modelId: string) => void;
};

export const StyledModelTableRow = styled(TableRow)`
  grid-template-columns: 1fr 100px 36px;
`;

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(1)};
  min-width: 0;
  overflow: hidden;
`;

const StyledModelName = styled.span<{ isDeprecated: boolean }>`
  color: ${({ theme, isDeprecated }) =>
    isDeprecated ? theme.font.color.light : theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDeprecatedBadge = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  flex-shrink: 0;
`;

const StyledProviderCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.secondary};
  justify-content: flex-end;
`;

const StyledCheckboxCell = styled(TableCell)`
  justify-content: center;
  padding: 0;
`;

export const SettingsAIAvailableModelRow = ({
  model,
  checked,
  onToggle,
}: SettingsAIAvailableModelRowProps) => {
  const theme = useTheme();
  const isDeprecated = model.deprecated === true;

  const config = PROVIDER_CONFIG[model.provider.toUpperCase()];
  const ProviderIcon = config?.Icon ?? IconRobot;
  const providerLabel = config?.label ?? model.provider;

  return (
    <StyledModelTableRow>
      <StyledNameTableCell>
        <ProviderIcon size={16} color={theme.font.color.secondary} />
        <StyledModelName isDeprecated={isDeprecated}>
          {model.label}
        </StyledModelName>
        {isDeprecated && (
          <StyledDeprecatedBadge>{t`· Deprecated...`}</StyledDeprecatedBadge>
        )}
      </StyledNameTableCell>
      <StyledProviderCell align="right">{providerLabel}</StyledProviderCell>
      <StyledCheckboxCell>
        <Checkbox checked={checked} onChange={() => onToggle(model.modelId)} />
      </StyledCheckboxCell>
    </StyledModelTableRow>
  );
};
