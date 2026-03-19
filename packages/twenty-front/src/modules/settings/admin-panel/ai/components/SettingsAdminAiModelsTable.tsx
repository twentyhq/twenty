import { useContext, useState } from 'react';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { AppTooltip, TooltipDelay } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsAdminAiModelHoverCard } from '@/settings/admin-panel/ai/components/SettingsAdminAiModelHoverCard';
import { type AdminAiModelConfig } from '~/generated-metadata/graphql';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getModelFamilyLabel } from '@/settings/admin-panel/ai/utils/getModelFamilyLabel';
import { getModelIcon } from '@/settings/admin-panel/ai/utils/getModelIcon';

const GRID_TEMPLATE_COLUMNS = '1fr 120px 40px';

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
};

export const SettingsAdminAiModelsTable = ({
  models,
  onToggle,
  checkedField,
  anchorPrefix,
  showDisabledState = false,
}: SettingsAdminAiModelsTableProps) => {
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const { theme } = useContext(ThemeContext);

  const hoveredModel = models.find((model) => model.modelId === hoveredModelId);

  return (
    <>
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>
            <Trans>Name</Trans>
          </TableHeader>
          <TableHeader align="right">
            <Trans>Provider</Trans>
          </TableHeader>
          <TableHeader />
        </TableRow>
        <TableBody>
          {models.map((model) => {
            const ModelIcon = getModelIcon(model.modelFamily);
            const familyLabel = getModelFamilyLabel(model.modelFamily);
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
                  gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
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
                    {familyLabel}
                  </TableCell>
                  <TableCell align="right">
                    <Checkbox
                      checked={isChecked}
                      disabled={isDisabled}
                      onChange={() => onToggle(model.modelId, isChecked)}
                    />
                  </TableCell>
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
