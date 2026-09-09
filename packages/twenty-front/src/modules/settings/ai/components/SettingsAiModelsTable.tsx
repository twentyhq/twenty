import { Fragment, useContext, useId } from 'react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconTrash } from 'twenty-ui/icon';
import { AppTooltip, TooltipDelay } from 'twenty-ui/surfaces';
import { Checkbox, IconButton } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAiModelHoverCard } from '@/settings/ai/components/SettingsAiModelHoverCard';
import { billingState } from '@/client-config/states/billingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAiModelComparisonItems } from '@/settings/ai/utils/getAiModelComparisonItems';
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

const hoverCardTooltipClass = css`
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
`;

const getProviderDisplayLabel = (model: AiModelSummary): string =>
  model.providerLabel ?? model.providerName ?? '';

type SettingsAiModelsTableProps<TModel extends AiModelSummary> = {
  models: TModel[];
  comparisonModels: TModel[];
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
  comparisonModels,
  isChecked,
  isDisabled,
  onToggle,
  onToggleAll,
  onRemove,
  showProviderColumn = true,
  anchorPrefix,
}: SettingsAiModelsTableProps<TModel>) => {
  const { theme } = useContext(ThemeContext);
  const tableId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const billing = useAtomStateValue(billingState);
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
                onChange={() => onToggleAll(!allChecked)}
              />
            )}
          </TableHeader>
          {hasRemove && <TableHeader />}
        </TableRow>
        <TableBody>
          {models.map((model, index) => {
            const ModelIcon = getModelIcon(
              model.modelFamily,
              model.providerName,
            );
            const safeId = `${tableId}-${index}`;
            const checked = isChecked(model);
            const disabled = isDisabled?.(model) ?? false;
            const { benchmarkItems, pricingItems } = getAiModelComparisonItems({
              requestedModel: model,
              comparisonModels,
              isBillingEnabled: billing?.isBillingEnabled ?? false,
            });
            const modelDescription = [...benchmarkItems, ...pricingItems]
              .map(
                (item) =>
                  `${item.label}: ${item.value}. ${item.description ?? ''}`,
              )
              .join(' ');

            return (
              <Fragment key={model.modelId}>
                <TableRow
                  key={model.modelId}
                  id={anchorPrefix ? `${anchorPrefix}-${safeId}` : undefined}
                  gridTemplateColumns={gridColumns}
                  onClick={
                    disabled
                      ? undefined
                      : () => onToggle(model.modelId, checked)
                  }
                >
                  <TableCell
                    color={
                      disabled
                        ? themeCssVariables.font.color.light
                        : themeCssVariables.font.color.primary
                    }
                  >
                    <StyledModelNameCell
                      id={
                        anchorPrefix
                          ? `${anchorPrefix}-${safeId}-name`
                          : undefined
                      }
                      tabIndex={anchorPrefix ? 0 : undefined}
                      role={anchorPrefix ? 'button' : undefined}
                      aria-pressed={anchorPrefix ? checked : undefined}
                      aria-disabled={anchorPrefix ? disabled : undefined}
                      aria-describedby={
                        anchorPrefix
                          ? `${anchorPrefix}-${safeId}-description`
                          : undefined
                      }
                      onKeyDown={(event) => {
                        if (!disabled && ['Enter', ' '].includes(event.key)) {
                          event.preventDefault();
                          onToggle(model.modelId, checked);
                        }
                      }}
                    >
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
                      {anchorPrefix && (
                        <span
                          id={`${anchorPrefix}-${safeId}-description`}
                          hidden
                        >
                          {modelDescription}
                        </span>
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
                      onChange={() => onToggle(model.modelId, checked)}
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
                {anchorPrefix && (
                  <AppTooltip
                    anchorSelect={`#${anchorPrefix}-${safeId}, #${anchorPrefix}-${safeId}-name`}
                    place="top-end"
                    interactive
                    noArrow
                    offset={8}
                    delay={TooltipDelay.noDelay}
                    className={hoverCardTooltipClass}
                    maxWidth="300px"
                  >
                    <SettingsAiModelHoverCard
                      model={model}
                      comparisonModels={comparisonModels}
                    />
                  </AppTooltip>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
