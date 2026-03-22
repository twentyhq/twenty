import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { getOperationTypeLabel } from '@/settings/usage/utils/getOperationTypeLabel';
import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { UsagePieChart } from '@/settings/usage/components/UsagePieChart';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar, H2Title, IconChevronRight } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import { GetUsageAnalyticsDocument } from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledIconChevronRightContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledLineChartContainer = styled.div`
  height: 200px;
  width: 100%;
`;

const USAGE_USER_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 120px 36px';

export const SettingsUsageAnalyticsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();

  const [typePeriod, setTypePeriod] = useState<PeriodPreset>('30d');
  const [dailyPeriod, setDailyPeriod] = useState<PeriodPreset>('30d');
  const [userPeriod, setUserPeriod] = useState<PeriodPreset>('30d');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const colorRegistry = createGraphColorRegistry(theme.color);
  const periodOptions = getPeriodOptions();

  const typeDates = getPeriodDates(typePeriod);
  const dailyDates = getPeriodDates(dailyPeriod);
  const userDates = getPeriodDates(userPeriod);

  const { data: typeData, loading: typeLoading } = useQuery(
    GetUsageAnalyticsDocument,
    { variables: { input: typeDates } },
  );

  const { data: dailyData, loading: dailyLoading } = useQuery(
    GetUsageAnalyticsDocument,
    { variables: { input: dailyDates } },
  );

  const { data: userData, loading: userLoading } = useQuery(
    GetUsageAnalyticsDocument,
    { variables: { input: userDates } },
  );

  const typeAnalytics = typeData?.getUsageAnalytics;
  const dailyAnalytics = dailyData?.getUsageAnalytics;
  const userAnalytics = userData?.getUsageAnalytics;

  const usageByOperationType = typeAnalytics?.usageByOperationType ?? [];
  const timeSeries = dailyAnalytics?.timeSeries ?? [];
  const usageByUser = userAnalytics?.usageByUser ?? [];

  const anyLoading = typeLoading || dailyLoading || userLoading;

  if (anyLoading) {
    return null;
  }

  const hasAnyData =
    usageByOperationType.length > 0 ||
    timeSeries.length > 0 ||
    usageByUser.length > 0;

  const totalCredits = usageByOperationType.reduce(
    (sum, item) => sum + item.creditsUsed,
    0,
  );

  const filteredUsageByUser = usageByUser.filter((item) => {
    const search = normalizeSearchText(userSearchTerm);
    const name = normalizeSearchText(item.label ?? item.key);

    return name.includes(search);
  });

  const pieData = usageByOperationType.map((item, index) => ({
    id: getOperationTypeLabel(item.key),
    value: item.creditsUsed,
    color: getColorSchemeByIndex(colorRegistry, index).solid,
  }));

  const lineData: LineChartSeriesWithColor[] = [
    {
      id: 'credits',
      label: t`Credits`,
      data: timeSeries.map((point) => ({
        x: formatDate(point.date, 'MMM d'),
        y: point.creditsUsed,
      })),
    },
  ];

  if (!hasAnyData) {
    return (
      <Section>
        <H2Title
          title={t`Usage Analytics`}
          description={t`Credit usage breakdown for your workspace.`}
        />
        <SubscriptionInfoContainer>
          <SettingsBillingLabelValueItem
            label={t`No usage data`}
            value={t`No credit consumption recorded yet.`}
          />
        </SubscriptionInfoContainer>
      </Section>
    );
  }

  return (
    <>
      {usageByOperationType.length > 0 && (
        <Section>
          <H2Title
            title={t`Usage by Type`}
            description={t`${formatNumber(totalCredits)} credits`}
            adornment={
              <Select
                dropdownId="usage-type-period"
                value={typePeriod}
                options={periodOptions}
                onChange={setTypePeriod}
                needIconCheck
                selectSizeVariant="small"
              />
            }
          />
          <SubscriptionInfoContainer>
            <UsagePieChart data={pieData} />
          </SubscriptionInfoContainer>
        </Section>
      )}

      {timeSeries.length > 0 && (
        <Section>
          <H2Title
            title={t`Daily Usage`}
            description={t`Credit consumption over time.`}
            adornment={
              <Select
                dropdownId="usage-daily-period"
                value={dailyPeriod}
                options={periodOptions}
                onChange={setDailyPeriod}
                needIconCheck
                selectSizeVariant="small"
              />
            }
          />
          <SubscriptionInfoContainer>
            <StyledLineChartContainer>
              <GraphWidgetLineChart
                id="usage-daily-line-chart"
                data={lineData}
                colorMode="automaticPalette"
                showLegend={false}
                enableArea
              />
            </StyledLineChartContainer>
          </SubscriptionInfoContainer>
        </Section>
      )}

      {usageByUser.length > 0 && (
        <Section>
          <H2Title
            title={t`Usage by User`}
            description={t`Click a user to see their daily breakdown.`}
            adornment={
              <Select
                dropdownId="usage-user-period"
                value={userPeriod}
                options={periodOptions}
                onChange={setUserPeriod}
                needIconCheck
                selectSizeVariant="small"
              />
            }
          />
          <StyledSearchInputContainer>
            <SearchInput
              placeholder={t`Search for a user...`}
              value={userSearchTerm}
              onChange={setUserSearchTerm}
            />
          </StyledSearchInputContainer>
          <Table>
            <TableRow
              gridTemplateColumns={USAGE_USER_TABLE_GRID_TEMPLATE_COLUMNS}
            >
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader align="right">{t`Credits`}</TableHeader>
              <TableHeader />
            </TableRow>
            {filteredUsageByUser.map((item) => (
              <TableRow
                key={item.key}
                gridTemplateColumns={USAGE_USER_TABLE_GRID_TEMPLATE_COLUMNS}
                to={getSettingsPath(SettingsPath.UsageUserDetail, {
                  userWorkspaceId: item.key,
                })}
              >
                <TableCell
                  color={themeCssVariables.font.color.primary}
                  gap={themeCssVariables.spacing[2]}
                >
                  <Avatar
                    type="rounded"
                    size="md"
                    placeholder={item.label ?? item.key}
                    placeholderColorSeed={item.key}
                  />
                  {item.label ?? item.key}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(item.creditsUsed)}
                </TableCell>
                <TableCell align="center">
                  <StyledIconChevronRightContainer>
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  </StyledIconChevronRightContainer>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Section>
      )}
    </>
  );
};
