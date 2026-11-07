import {
  type SettingsBillingPlanComparisonCell,
  type SettingsBillingPlanComparisonRow,
} from '@/settings/billing/types/SettingsBillingPlanComparison';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { MOBILE_VIEWPORT, themeCssVariables, useTheme } from 'twenty-ui/theme';
import { type BillingPlanKey } from '~/generated-metadata/graphql';

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
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-top: 0;
    min-height: auto;
    padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}
      ${themeCssVariables.spacing[2]};
  }
`;

const StyledFeatureLabelCell = styled(StyledFeatureCell)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    border-top: ${({ hasTopBorder }) =>
      hasTopBorder
        ? `1px solid ${themeCssVariables.border.color.medium}`
        : '0'};
    grid-column: 1 / -1;
    padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} 0;
  }
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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: 0 ${themeCssVariables.spacing[2]};
  }
`;

const StyledCellText = styled.span`
  min-width: 0;
`;

const StyledCellTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-wrap: anywhere;
`;

const StyledCellDetail = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledComparisonCellIcon = styled.div<{ isIncluded: boolean }>`
  color: ${({ isIncluded }) =>
    isIncluded
      ? themeCssVariables.accent.accent9
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

const renderWithLineBreaksAfterSlashes = (text: string) =>
  text.split('/').map((part, index) => (
    <Fragment key={index}>
      {index > 0 && (
        <>
          /<wbr />
        </>
      )}
      {part}
    </Fragment>
  ));

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

  return (
    <StyledCellTextGroup>
      <StyledCellText>
        {renderWithLineBreaksAfterSlashes(i18n._(cell.text))}
      </StyledCellText>
      {isDefined(cell.detail) && (
        <StyledCellDetail>
          {renderWithLineBreaksAfterSlashes(i18n._(cell.detail))}
        </StyledCellDetail>
      )}
    </StyledCellTextGroup>
  );
};

export const SettingsBillingPlanComparisonTableRow = ({
  hasTopBorder = false,
  planKeys,
  row,
}: {
  hasTopBorder?: boolean;
  planKeys: BillingPlanKey[];
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
      <StyledFeatureLabelCell hasTopBorder={hasTopBorder} isLabel>
        <StyledCellText>{i18n._(row.featureLabel)}</StyledCellText>
      </StyledFeatureLabelCell>
      {planKeys.map((planKey) => (
        <StyledFeatureCell hasTopBorder={hasTopBorder} key={planKey}>
          <SettingsBillingPlanComparisonCellContent cell={row.plans[planKey]} />
        </StyledFeatureCell>
      ))}
    </>
  );
};
