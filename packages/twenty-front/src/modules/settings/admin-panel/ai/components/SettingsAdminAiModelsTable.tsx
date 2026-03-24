import { useContext, useState } from 'react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, IconTrash, TooltipDelay } from 'twenty-ui/display';
import { Checkbox, IconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminAiModelHoverCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiModelHoverCard';
import { type AdminAiModelConfig } from '~/generated-metadata/graphql';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getModelIcon } from '@/settings/admin-panel/ai/utils/getModelIcon';

const getProviderDisplayLabel = (
  model: Pick<AdminAiModelConfig, 'providerLabel' | 'providerName'>,
): string => model.providerLabel ?? model.providerName ?? '';

const formatCost = (
  model: Pick<
    AdminAiModelConfig,
    'inputCostPerMillionTokens' | 'outputCostPerMillionTokens'
  >,
): string => {
  const input = model.inputCostPerMillionTokens;
  const output = model.outputCostPerMillionTokens;

  if (!isDefined(input) && !isDefined(output)) {
    return '—';
  }

  const formatValue = (value: number | null | undefined) =>
    isDefined(value) ? `$${value}` : '—';

  return `${formatValue(input)} / ${formatValue(output)}`;
};

type SecondaryColumn = 'provider' | 'cost';

const GRID_TEMPLATE_COLUMNS: Record<SecondaryColumn, string> = {
  provider: '1fr 120px 40px',
  cost: '1fr 140px 40px',
};

const GRID_TEMPLATE_COLUMNS_WITH_REMOVE: Record<SecondaryColumn, string> = {
  provider: '1fr 120px 40px 32px',
  cost: '1fr 140px 40px 32px',
};

const StyledModelNameCell = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  overflow: hidden;
`;

const StyledModelLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDeprecatedSuffix = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const hoverCardTooltipClass = css`
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
`;

const sanitizeIdForSelector = (id: string): string =>
  id.replace(/[^a-zA-Z0-9-_]/g, '_');

type SettingsAdminAiModelsTableProps = {
  models: AdminAiModelConfig[];
  onToggle: (modelId: string, currentValue: boolean) => void;
  checkedField: 'isAdminEnabled' | 'isRecommended';
  anchorPrefix: string;
  showDisabledState?: boolean;
  onRemove?: (model: AdminAiModelConfig) => void;
  secondaryColumn?: SecondaryColumn;
};

export const SettingsAdminAiModelsTable = ({
  models,
  onToggle,
  checkedField,
  anchorPrefix,
  showDisabledState = false,
  onRemove,
  secondaryColumn = 'provider',
}: SettingsAdminAiModelsTableProps) => {
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  const hoveredModel = models.find((model) => model.modelId === hoveredModelId);
  const hasRemove = isDefined(onRemove);
  const gridColumns = hasRemove
    ? GRID_TEMPLATE_COLUMNS_WITH_REMOVE[secondaryColumn]
    : GRID_TEMPLATE_COLUMNS[secondaryColumn];

  return (
    <>
      <Table>
        <TableRow gridTemplateColumns={gridColumns}>
          <TableHeader>
            <Trans>Name</Trans>
          </TableHeader>
          <TableHeader align="right">
            {secondaryColumn === 'provider' ? (
              <Trans>Provider</Trans>
            ) : (
              <Trans>Cost / 1M tokens</Trans>
            )}
          </TableHeader>
          <TableHeader />
          {hasRemove && <TableHeader />}
        </TableRow>
        <TableBody>
          {models.map((model) => {
            const ModelIcon = getModelIcon(
              model.modelFamily,
              model.providerName,
            );
            const displayLabel = getProviderDisplayLabel(model);
            const safeId = sanitizeIdForSelector(model.modelId);
            const isChecked = model[checkedField] === true;
            const isDisabled =
              showDisabledState &&
              (!model.isAvailable || model.isDeprecated === true);

            return (
              <div
                key={model.modelId}
                id={`${anchorPrefix}-${safeId}`}
                onMouseEnter={() => setHoveredModelId(model.modelId)}
                onMouseLeave={() => setHoveredModelId(null)}
              >
                <TableRow
                  gridTemplateColumns={gridColumns}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => onToggle(model.modelId, isChecked)
                  }
                >
                  <TableCell
                    color={
                      isDisabled
                        ? themeCssVariables.font.color.light
                        : themeCssVariables.font.color.primary
                    }
                  >
                    <StyledModelNameCell>
                      <ModelIcon
                        size={theme.icon.size.md}
                        stroke={theme.icon.stroke.sm}
                        color={
                          isDisabled
                            ? theme.font.color.light
                            : theme.font.color.secondary
                        }
                      />
                      <StyledModelLabel>{model.label}</StyledModelLabel>
                      {showDisabledState && model.isDeprecated && (
                        <StyledDeprecatedSuffix>
                          · Deprecated
                        </StyledDeprecatedSuffix>
                      )}
                    </StyledModelNameCell>
                  </TableCell>
                  <TableCell
                    align="right"
                    color={themeCssVariables.font.color.tertiary}
                  >
                    {secondaryColumn === 'provider'
                      ? displayLabel
                      : formatCost(model)}
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => onToggle(model.modelId, isChecked)}
                    />
                  </TableCell>
                  {hasRemove && (
                    <TableCell align="right">
                      <IconButton
                        Icon={IconTrash}
                        accent="danger"
                        variant="tertiary"
                        size="small"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemove(model);
                        }}
                      />
                    </TableCell>
                  )}
                </TableRow>
              </div>
            );
          })}
        </TableBody>
      </Table>

      {hoveredModel && (
        <AppTooltip
          anchorSelect={`#${anchorPrefix}-${sanitizeIdForSelector(hoveredModel.modelId)}`}
          place="left"
          noArrow
          offset={8}
          delay={TooltipDelay.noDelay}
          className={hoverCardTooltipClass}
          width="320px"
        >
          <SettingsAdminAiModelHoverCard
            label={hoveredModel.label}
            modelFamily={hoveredModel.modelFamily}
            providerName={hoveredModel.providerName}
            providerLabel={getProviderDisplayLabel(hoveredModel)}
            contextWindowTokens={hoveredModel.contextWindowTokens}
            maxOutputTokens={hoveredModel.maxOutputTokens}
            inputCostPerMillionTokens={hoveredModel.inputCostPerMillionTokens}
            outputCostPerMillionTokens={hoveredModel.outputCostPerMillionTokens}
            dataResidency={hoveredModel.dataResidency}
          />
        </AppTooltip>
      )}
    </>
  );
};
