import { SettingsBillingLabelValueItem } from '@/settings/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { GraphWidgetLineChart } from '@/page-layout/widgets/graph/graph-widget-line-chart/components/GraphWidgetLineChart';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graph-widget-line-chart/types/LineChartSeriesWithColor';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { Select } from '@/ui/input/components/Select';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getOperationTypeLabel } from '@/settings/usage/utils/getOperationTypeLabel';
import { getPeriodDates } from '@/settings/usage/utils/getPeriodDates';
import { getPeriodOptions } from '@/settings/usage/utils/getPeriodOptions';
import { type PeriodPreset } from '@/settings/usage/utils/periodPreset';
import { UsagePieChart } from '@/settings/usage/components/UsagePieChart';
import { Trans, useLingui } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar, H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import { GetUsageAnalyticsDocument } from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';

const StyledUserHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledUserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledUserName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledUserCredits = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledLineChartContainer = styled.div`
  height: 200px;
  width: 100%;
`;

export const SettingsUsageUserDetail = () => {
  const { t: tLingui } = useLingui();
  const { userWorkspaceId } = useParams<{ userWorkspaceId: string }>();
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();
  const colorRegistry = createGraphColorRegistry(theme.color);

  const [dailyPeriod, setDailyPeriod] = useState<PeriodPreset>('30d');
  const [typePeriod, setTypePeriod] = useState<PeriodPreset>('30d');

  const periodOptions = getPeriodOptions();

  const dailyDates = getPeriodDates(dailyPeriod);
  const typeDates = getPeriodDates(typePeriod);

  const { data: dailyData, loading: dailyLoading } = useQuery(
    GetUsageAnalyticsDocument,
    {
      variables: {
        input: {
          ...dailyDates,
          userWorkspaceId,
        },
      },
      skip: !userWorkspaceId,
    },
  );

  const { data: typeData, loading: typeLoading } = useQuery(
    GetUsageAnalyticsDocument,
    {
      variables: {
        input: {
          ...typeDates,
          userWorkspaceId,
        },
      },
      skip: !userWorkspaceId,
    },
  );

  const dailyAnalytics = dailyData?.getUsageAnalytics;
  const typeAnalytics = typeData?.getUsageAnalytics;

  const userDailyUsage = dailyAnalytics?.userDailyUsage?.dailyUsage ?? [];
  const usageByOperationType = typeAnalytics?.usageByOperationType ?? [];

  const userName =
    dailyAnalytics?.usageByUser?.find((item) => item.key === userWorkspaceId)
      ?.label ??
    typeAnalytics?.usageByUser?.find((item) => item.key === userWorkspaceId)
      ?.label;

  const totalCredits = usageByOperationType.reduce(
    (sum, item) => sum + item.creditsUsed,
    0,
  );

  const displayName = userName ?? userWorkspaceId ?? '';

  const pieData = usageByOperationType.map((item, index) => ({
    id: getOperationTypeLabel(item.key),
    value: item.creditsUsed,
    color: getColorSchemeByIndex(colorRegistry, index).solid,
  }));

  const lineData: LineChartSeriesWithColor[] = [
    {
      id: 'credits',
      label: t`Credits`,
      data: userDailyUsage.map((point) => ({
        x: formatDate(point.date, 'MMM d'),
        y: point.creditsUsed,
      })),
    },
  ];

  const isInitialLoading =
    (dailyLoading || typeLoading) && !dailyData && !typeData;

  const breadcrumbLinks = [
    {
      children: <Trans>Workspace</Trans>,
      href: getSettingsPath(SettingsPath.Workspace),
    },
    {
      children: <Trans>Usage</Trans>,
      href: getSettingsPath(SettingsPath.Usage),
    },
    { children: isInitialLoading ? '' : displayName },
  ];

  if (isInitialLoading) {
    return (
      <SubMenuTopBarContainer
        title={tLingui`User Usage`}
        links={breadcrumbLinks}
      >
        <SettingsPageContainer>
          <SkeletonTheme
            baseColor={theme.background.tertiary}
            highlightColor={theme.background.transparent.lighter}
            borderRadius={4}
          >
            <StyledUserHeader>
              <Skeleton width={40} height={40} borderRadius={8} />
              <StyledUserInfo>
                <Skeleton width={160} height={16} />
                <Skeleton width={100} height={13} />
              </StyledUserInfo>
            </StyledUserHeader>
            <Section>
              <Skeleton width={120} height={16} />
              <Skeleton
                width="100%"
                height={200}
                borderRadius={8}
                style={{ marginTop: 16 }}
              />
            </Section>
            <Section>
              <Skeleton width={120} height={16} />
              <Skeleton
                width="100%"
                height={220}
                borderRadius={8}
                style={{ marginTop: 16 }}
              />
            </Section>
          </SkeletonTheme>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    );
  }

  return (
    <SubMenuTopBarContainer title={tLingui`User Usage`} links={breadcrumbLinks}>
      <SettingsPageContainer>
        <StyledUserHeader>
          <Avatar
            type="rounded"
            size="xl"
            placeholder={displayName}
            placeholderColorSeed={userWorkspaceId}
          />
          <StyledUserInfo>
            <StyledUserName>{displayName}</StyledUserName>
            <StyledUserCredits>
              {t`${formatNumber(totalCredits)} credits used`}
            </StyledUserCredits>
          </StyledUserInfo>
        </StyledUserHeader>

        {userDailyUsage.length === 0 && pieData.length === 0 && (
          <Section>
            <SubscriptionInfoContainer>
              <SettingsBillingLabelValueItem
                label={t`No usage data`}
                value={t`No credit consumption recorded for this user.`}
              />
            </SubscriptionInfoContainer>
          </Section>
        )}

        {userDailyUsage.length > 0 && (
          <Section>
            <H2Title
              title={t`Daily Usage`}
              description={t`Per-day credit consumption.`}
              adornment={
                <Select
                  dropdownId="user-daily-period"
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
                  id="user-daily-line-chart"
                  data={lineData}
                  colorMode="automaticPalette"
                  showLegend={false}
                  enableArea
                />
              </StyledLineChartContainer>
            </SubscriptionInfoContainer>
          </Section>
        )}

        {usageByOperationType.length > 0 && (
          <Section>
            <H2Title
              title={t`Usage by Type`}
              description={t`${formatNumber(totalCredits)} credits`}
              adornment={
                <Select
                  dropdownId="user-type-period"
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
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
