import { BillingChartTooltip } from '@/billing/components/BillingChartTooltip';
import {
  StyledBillingLineChartContainer,
  StyledBillingPieChartContainer,
} from '@/billing/components/BillingChartContainers';
import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { getOperationTypeLabel } from '@/billing/utils/getOperationTypeLabel';
import { getPeriodDates } from '@/billing/utils/getPeriodDates';
import { getPeriodOptions } from '@/billing/utils/getPeriodOptions';
import { type PeriodPreset } from '@/billing/utils/PeriodPreset';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { CHART_MOTION_CONFIG } from '@/page-layout/widgets/graph/constants/ChartMotionConfig';
import { useLineChartTheme } from '@/page-layout/widgets/graph/graph-widget-line-chart/hooks/useLineChartTheme';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { useContext, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar, H2Title, IconChevronRight } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import { GetUsageAnalyticsDocument } from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledBarRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledBarLabel = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledLabelText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValueText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledIconChevronRightContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const USAGE_USER_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 120px 36px';

export const SettingsBillingAnalyticsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();

  const [typePeriod, setTypePeriod] = useState<PeriodPreset>('30d');
  const [dailyPeriod, setDailyPeriod] = useState<PeriodPreset>('30d');
  const [userPeriod, setUserPeriod] = useState<PeriodPreset>('30d');
  const [resourcePeriod, setResourcePeriod] = useState<PeriodPreset>('30d');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const colorRegistry = createGraphColorRegistry(theme.color);
  const lineChartTheme = useLineChartTheme();
  const periodOptions = getPeriodOptions();

  const typeDates = getPeriodDates(typePeriod);
  const dailyDates = getPeriodDates(dailyPeriod);
  const userDates = getPeriodDates(userPeriod);
  const resourceDates = getPeriodDates(resourcePeriod);

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

  const { data: resourceData, loading: resourceLoading } = useQuery(
    GetUsageAnalyticsDocument,
    { variables: { input: resourceDates } },
  );

  const typeAnalytics = typeData?.getUsageAnalytics;
  const dailyAnalytics = dailyData?.getUsageAnalytics;
  const userAnalytics = userData?.getUsageAnalytics;
  const resourceAnalytics = resourceData?.getUsageAnalytics;

  const usageByOperationType = typeAnalytics?.usageByOperationType ?? [];
  const timeSeries = dailyAnalytics?.timeSeries ?? [];
  const usageByUser = userAnalytics?.usageByUser ?? [];
  const usageByResource = resourceAnalytics?.usageByResource ?? [];

  const allLoading =
    typeLoading && dailyLoading && userLoading && resourceLoading;

  if (allLoading) {
    return null;
  }

  const hasAnyData =
    usageByOperationType.length > 0 ||
    timeSeries.length > 0 ||
    usageByUser.length > 0 ||
    usageByResource.length > 0;

  const totalCredits = usageByOperationType.reduce(
    (sum, item) => sum + item.creditsUsed,
    0,
  );

  const resourceTotal = usageByResource.reduce(
    (sum, resource) => sum + resource.creditsUsed,
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

  const lineData = [
    {
      id: 'credits',
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
            <StyledBillingPieChartContainer>
              <ResponsivePie
                data={pieData}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                innerRadius={0.6}
                padAngle={0.5}
                cornerRadius={2}
                colors={pieData.map((item) => item.color)}
                enableArcLabels={false}
                enableArcLinkLabels={true}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor={theme.font.color.secondary}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLinkLabelsDiagonalLength={10}
                arcLinkLabelsStraightLength={10}
                animate
                motionConfig={CHART_MOTION_CONFIG}
                tooltip={({ datum }) => (
                  <BillingChartTooltip
                    label={String(datum.id)}
                    value={t`${formatNumber(datum.value)} credits`}
                  />
                )}
              />
            </StyledBillingPieChartContainer>
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
            <StyledBillingLineChartContainer>
              <ResponsiveLine
                data={lineData}
                margin={{ top: 10, right: 20, bottom: 30, left: 50 }}
                xScale={{ type: 'point' }}
                yScale={{
                  type: 'linear',
                  min: 0,
                  max: 'auto',
                }}
                curve="monotoneX"
                lineWidth={2}
                colors={[theme.color.blue]}
                enablePoints={true}
                pointSize={6}
                pointColor={theme.background.primary}
                pointBorderWidth={2}
                pointBorderColor={theme.color.blue}
                enableArea={true}
                areaOpacity={0.1}
                enableGridX={false}
                enableGridY={true}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 8,
                  tickRotation: timeSeries.length > 14 ? -45 : 0,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  tickValues: 5,
                }}
                animate
                motionConfig={CHART_MOTION_CONFIG}
                theme={lineChartTheme}
                enableSlices="x"
                sliceTooltip={({ slice }) => (
                  <BillingChartTooltip
                    label={String(slice.points[0]?.data.xFormatted)}
                    value={t`${formatNumber(Number(slice.points[0]?.data.yFormatted))} credits`}
                  />
                )}
              />
            </StyledBillingLineChartContainer>
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

      {usageByResource.length > 0 && (
        <Section>
          <H2Title
            title={t`Usage by Resource`}
            description={t`Credit consumption per agent or workflow.`}
            adornment={
              <Select
                dropdownId="usage-resource-period"
                value={resourcePeriod}
                options={periodOptions}
                onChange={setResourcePeriod}
                needIconCheck
                selectSizeVariant="small"
              />
            }
          />
          <SubscriptionInfoContainer>
            {usageByResource.map((item, index) => {
              const percentage =
                resourceTotal > 0
                  ? (item.creditsUsed / resourceTotal) * 100
                  : 0;

              return (
                <StyledBarRow key={item.key}>
                  <StyledBarLabel>
                    <StyledLabelText>{item.label ?? item.key}</StyledLabelText>
                    <StyledValueText>
                      {t`${formatNumber(item.creditsUsed)} credits`}
                    </StyledValueText>
                  </StyledBarLabel>
                  <ProgressBar
                    value={percentage < 3 && percentage > 0 ? 3 : percentage}
                    barColor={getColorSchemeByIndex(colorRegistry, index).solid}
                    backgroundColor={theme.background.tertiary}
                    withBorderRadius
                  />
                </StyledBarRow>
              );
            })}
          </SubscriptionInfoContainer>
        </Section>
      )}
    </>
  );
};
