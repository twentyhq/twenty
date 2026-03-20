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

const GRID_TEMPLATE_COLUMNS = '1fr 120px 40px';
const GRID_TEMPLATE_COLUMNS_WITH_REMOVE = '1fr 120px 40px 32px';

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
};

export const SettingsAdminAiModelsTable = ({
  models,
  onToggle,
  checkedField,
  anchorPrefix,
  showDisabledState = false,
  onRemove,
}: SettingsAdminAiModelsTableProps) => {
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  const hoveredModel = models.find((model) => model.modelId === hoveredModelId);
  const hasRemove = isDefined(onRemove);
  const gridColumns = hasRemove
    ? GRID_TEMPLATE_COLUMNS_WITH_REMOVE
    : GRID_TEMPLATE_COLUMNS;

  return (
    <>
      <Table>
        <TableRow gridTemplateColumns={gridColumns}>
          <TableHeader>
            <Trans>Name</Trans>
          </TableHeader>
          <TableHeader align="right">
            <Trans>Provider</Trans>
          </TableHeader>
          <TableHeader />
          {hasRemove && <TableHeader />}
        </TableRow>
        <TableBody>
          {models.map((model) => {
            const ModelIcon = getModelIcon(model.modelFamily);
            const providerLabel =
              model.providerLabel ?? model.providerName ?? '';
            const safeId = sanitizeIdForSelector(model.modelId);
            const isChecked = model[checkedField] === true;
            const isDisabled =
              showDisabledState &&
              (!model.isAvailable || model.deprecated === true);

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
                      {showDisabledState && model.deprecated && (
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
                    {providerLabel}
                  </TableCell>
                  <TableCell align="right">
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
            providerLabel={
              hoveredModel.providerLabel ?? hoveredModel.providerName ?? ''
            }
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
