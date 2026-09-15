import { SETTINGS_BILLING_COMPARED_PLAN_KEYS } from '@/settings/billing/constants/SettingsBillingComparedPlanKeys';
import {
  type SettingsBillingPlanComparisonCell,
  type SettingsBillingPlanComparisonRow,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledFeatureCell = styled.div<{
  hasTopBorder?: boolean;
  isLabel?: boolean;
}>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-top: ${({ hasTopBorder }) =>
    hasTopBorder ? `1px solid ${themeCssVariables.border.color.medium}` : '0'};
  box-sizing: border-box;
  color: ${({ isLabel }) =>
    isLabel
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
  min-height: 40px;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledCategoryCell = styled.div<{ hasTopBorder?: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-top: ${({ hasTopBorder }) =>
    hasTopBorder ? `1px solid ${themeCssVariables.border.color.medium}` : '0'};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  grid-column: 1 / -1;
  line-height: 1.4;
  min-height: 40px;
  padding: 0 ${themeCssVariables.spacing[4]};
`;

const StyledCellText = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledComparisonCellIcon = styled.div<{ isIncluded: boolean }>`
  color: ${({ isIncluded }) =>
    isIncluded
      ? themeCssVariables.accent.accent9
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

const SettingsBillingPlanComparisonCellContent = ({
  cell,
}: {
  cell: SettingsBillingPlanComparisonCell;
}) => {
  const { i18n, t } = useLingui();
  const theme = useTheme();

  if (cell.kind === 'included') {
    return (
      <StyledComparisonCellIcon aria-label={t`Included`} role="img" isIncluded>
        <IconCheck size={theme.icon.size.sm} />
      </StyledComparisonCellIcon>
    );
  }

  if (cell.kind === 'excluded') {
    return (
      <StyledComparisonCellIcon
        aria-label={t`Not included`}
        role="img"
        isIncluded={false}
      >
        <IconX size={theme.icon.size.sm} />
      </StyledComparisonCellIcon>
    );
  }

  return <StyledCellText>{i18n._(cell.text)}</StyledCellText>;
};

export const SettingsBillingPlanComparisonTableRow = ({
  hasTopBorder = false,
  row,
}: {
  hasTopBorder?: boolean;
  row: SettingsBillingPlanComparisonRow;
}) => {
  const { i18n } = useLingui();

  if (row.type === 'category') {
    return (
      <StyledCategoryCell hasTopBorder={hasTopBorder}>
        <StyledCellText>{i18n._(row.title)}</StyledCellText>
      </StyledCategoryCell>
    );
  }

  return (
    <>
      <StyledFeatureCell hasTopBorder={hasTopBorder} isLabel>
        <StyledCellText>{i18n._(row.featureLabel)}</StyledCellText>
      </StyledFeatureCell>
      {SETTINGS_BILLING_COMPARED_PLAN_KEYS.map((planKey) => (
        <StyledFeatureCell hasTopBorder={hasTopBorder} key={planKey}>
          <SettingsBillingPlanComparisonCellContent cell={row.plans[planKey]} />
        </StyledFeatureCell>
      ))}
    </>
  );
};
