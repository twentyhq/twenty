import { t } from '@lingui/core/macro';
import { useContext, useRef, useState } from 'react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Checkbox } from 'twenty-ui/primitives/input';
import { IconButton } from 'twenty-ui/components';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAiModelHoverCard } from '@/settings/ai/components/SettingsAiModelHoverCard';
import { type AiModelSummary } from '@/settings/ai/types/AiModelSummary';
import { getModelIcon } from '@/settings/ai/utils/getModelIcon';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const GRID_COLUMNS = '1fr 120px 40px';
const GRID_COLUMNS_WITHOUT_PROVIDER = '1fr 40px';
const GRID_COLUMNS_WITH_REMOVE = '1fr 120px 40px 32px';
const GRID_COLUMNS_WITH_REMOVE_WITHOUT_PROVIDER = '1fr 40px 32px';

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

// An evaluation model cannot be chatted with or given to an agent, so a row
// that looks like every other row would read as interchangeable with them.
const StyledKindBadge = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

const hoverCardTooltipClass = css`
  border-radius: ${themeCssVariables.border.radius.rounded} !important;
  corner-shape: round;

  padding: 0 !important;
`;

const sanitizeIdForSelector = (id: string): string =>
  id.replace(/[^a-zA-Z0-9-_]/g, '_');

const getProviderDisplayLabel = (model: AiModelSummary): string =>
  model.providerLabel ?? model.providerName ?? '';

type SettingsAiModelsTableProps<TModel extends AiModelSummary> = {
  models: TModel[];
  isChecked: (model: TModel) => boolean;
  isDisabled?: (model: TModel) => boolean;
  onToggle: (modelId: string, isCurrentlyChecked: boolean) => void;
  onToggleAll?: (shouldCheckAll: boolean) => void;
  onRemove?: (model: TModel) => void;
  showProviderColumn?: boolean;
  anchorPrefix?: string;
};

export const SettingsAiModelsTable = <TModel extends AiModelSummary>({
  models,
  isChecked,
  isDisabled,
  onToggle,
  onToggleAll,
  onRemove,
  showProviderColumn = true,
  anchorPrefix,
}: SettingsAiModelsTableProps<TModel>) => {
  const hoveredRowRef = useRef<HTMLDivElement>(null);
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  const hoveredModel = models.find((model) => model.modelId === hoveredModelId);
  const hasRemove = isDefined(onRemove);
  const gridColumns = hasRemove
    ? showProviderColumn
      ? GRID_COLUMNS_WITH_REMOVE
      : GRID_COLUMNS_WITH_REMOVE_WITHOUT_PROVIDER
    : showProviderColumn
      ? GRID_COLUMNS
      : GRID_COLUMNS_WITHOUT_PROVIDER;

  const toggleableModels = models.filter(
    (model) => !(isDisabled?.(model) ?? false),
  );
  const checkedCount = toggleableModels.filter((model) =>
    isChecked(model),
  ).length;
  const allChecked =
    toggleableModels.length > 0 && checkedCount === toggleableModels.length;
  const noneChecked = checkedCount === 0;

  return (
    <>
      <Table>
        <TableRow gridTemplateColumns={gridColumns}>
          <TableHeader>
            <Trans>Name</Trans>
          </TableHeader>
          {showProviderColumn && (
            <TableHeader align="right">
              <Trans>Provider</Trans>
            </TableHeader>
          )}
          <TableHeader align="right">
            {isDefined(onToggleAll) && (
              <Checkbox
                checked={allChecked}
                indeterminate={!allChecked && !noneChecked}
                onCheckedChange={() => onToggleAll(!allChecked)}
              />
            )}
          </TableHeader>
          {hasRemove && <TableHeader />}
        </TableRow>
        <TableBody>
          {models.map((model) => {
            const ModelIcon = getModelIcon(
              model.modelFamily,
              model.providerName,
            );
            const safeId = sanitizeIdForSelector(model.modelId);
            const checked = isChecked(model);
            const disabled = isDisabled?.(model) ?? false;

            return (
              <TableRow
                key={model.modelId}
                id={anchorPrefix ? `${anchorPrefix}-${safeId}` : undefined}
                gridTemplateColumns={gridColumns}
                onMouseEnter={
                  anchorPrefix
                    ? (event) => {
                        hoveredRowRef.current = event.currentTarget;
                        setHoveredModelId(model.modelId);
                      }
                    : undefined
                }
                onMouseLeave={
                  anchorPrefix ? () => setHoveredModelId(null) : undefined
                }
                onClick={
                  disabled ? undefined : () => onToggle(model.modelId, checked)
                }
              >
                <TableCell
                  color={
                    disabled
                      ? themeCssVariables.font.color.light
                      : themeCssVariables.font.color.primary
                  }
                >
                  <StyledModelNameCell>
                    <ModelIcon
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                      color={
                        disabled
                          ? theme.font.color.light
                          : theme.font.color.secondary
                      }
                    />
                    <StyledModelLabel>{model.label}</StyledModelLabel>
                    {model.kind === 'evaluation' && (
                      <StyledKindBadge>
                        <Trans>Evaluation</Trans>
                      </StyledKindBadge>
                    )}
                    {disabled && model.isDeprecated && (
                      <StyledDeprecatedSuffix>
                        · <Trans>Deprecated</Trans>
                      </StyledDeprecatedSuffix>
                    )}
                  </StyledModelNameCell>
                </TableCell>
                {showProviderColumn && (
                  <TableCell
                    align="right"
                    color={themeCssVariables.font.color.tertiary}
                  >
                    {getProviderDisplayLabel(model)}
                  </TableCell>
                )}
                <TableCell
                  align="right"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={() => onToggle(model.modelId, checked)}
                  />
                </TableCell>
                {hasRemove && (
                  <TableCell align="right">
                    <IconButton
                      aria-label={t`Remove model`}
                      color="danger"
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemove(model);
                      }}
                    >
                      <IconTrash />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {anchorPrefix && hoveredModel && (
        <Tooltip.Root key={hoveredModel.modelId} open>
          <Tooltip.Popup
            anchor={hoveredRowRef}
            side="top"
            align="end"
            sideOffset={8}
            className={hoverCardTooltipClass}
            maxWidth="320px"
          >
            <SettingsAiModelHoverCard model={hoveredModel} />
          </Tooltip.Popup>
        </Tooltip.Root>
      )}
    </>
  );
};
