import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext, useMemo, useState } from 'react';
import { H2Title, HorizontalSeparator, IconArrowLeft } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useGetBillingAnalyticsQuery } from '~/generated-metadata/graphql';

const EXECUTION_TYPE_LABELS: Record<string, string> = {
  ai_token: 'AI Tokens',
  workflow_execution: 'Workflow Execution',
  code_execution: 'Code Execution',
};

type PeriodPreset = '7d' | '30d' | '90d' | 'billing';

const StyledBarRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledClickableBarRow = styled(StyledBarRow)`
  cursor: pointer;
  border-radius: ${themeCssVariables.border.radius.sm};
  padding: ${themeCssVariables.spacing[1]};
  margin: -${themeCssVariables.spacing[1]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledLabelText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
`;

const StyledValueText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTimeSeriesContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 80px;
  width: 100%;
`;

const StyledTimeSeriesBar = styled.div<{ height: string; color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 2px 2px 0 0;
  flex: 1;
  height: ${({ height }) => height};
  min-height: 2px;
`;

const StyledTimeSeriesLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledTimeSeriesLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 10px;
`;

const StyledPeriodSelector = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledPeriodButton = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.transparent.medium
      : themeCssVariables.background.transparent.lighter};
  border: 1px solid
    ${({ isActive }) =>
      isActive
        ? themeCssVariables.border.color.strong
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

const StyledBackButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const getBarColors = (theme: {
  color: { blue: string; purple: string; green: string; orange: string; turquoise: string; pink: string };
}): string[] => [
  theme.color.blue,
  theme.color.purple,
  theme.color.green,
  theme.color.orange,
  theme.color.turquoise,
  theme.color.pink,
];

const getPeriodDates = (
  preset: PeriodPreset,
): { periodStart?: string; periodEnd?: string } => {
  if (preset === 'billing') {
    return {};
  }

  const now = new Date();
  const daysMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  const days = daysMap[preset];
  const start = new Date(now);

  start.setDate(start.getDate() - days);

  return {
    periodStart: start.toISOString(),
    periodEnd: now.toISOString(),
  };
};

export const SettingsBillingAnalyticsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('billing');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const barColors = useMemo(() => getBarColors(theme), [theme]);

  const periodDates = getPeriodDates(periodPreset);

  const { data, loading } = useGetBillingAnalyticsQuery({
    variables: {
      ...(periodDates.periodStart && {
        periodStart: periodDates.periodStart,
      }),
      ...(periodDates.periodEnd && { periodEnd: periodDates.periodEnd }),
      ...(selectedUserId && { userWorkspaceId: selectedUserId }),
    },
  });

  const analyticsData = data?.getBillingAnalytics;

  if (loading && !analyticsData) {
    return null;
  }

  if (!analyticsData) {
    return null;
  }

  const {
    usageByUser,
    usageByResource,
    usageByExecutionType,
    timeSeries,
    userDailyUsage,
  } = analyticsData;

  const hasAnalyticsData =
    usageByExecutionType.length > 0 ||
    usageByUser.length > 0 ||
    usageByResource.length > 0;

  if (!hasAnalyticsData) {
    return null;
  }

  const totalCredits = usageByExecutionType.reduce(
    (sum, item) => sum + item.creditsUsed,
    0,
  );

  const displayTimeSeries =
    selectedUserId && userDailyUsage
      ? userDailyUsage.dailyUsage
      : timeSeries;

  const maxTimeSeriesValue = Math.max(
    ...displayTimeSeries.map((point) => point.creditsUsed),
    1,
  );

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);

    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const periodOptions: { key: PeriodPreset; label: string }[] = [
    { key: 'billing', label: t`Billing Period` },
    { key: '7d', label: t`7 days` },
    { key: '30d', label: t`30 days` },
    { key: '90d', label: t`90 days` },
  ];

  const handleUserClick = (userWorkspaceId: string) => {
    setSelectedUserId(userWorkspaceId);
  };

  const handleBackFromUser = () => {
    setSelectedUserId(null);
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Usage Analytics`}
          description={t`Credit usage breakdown for your workspace.`}
        />

        <StyledPeriodSelector>
          {periodOptions.map((option) => (
            <StyledPeriodButton
              key={option.key}
              isActive={periodPreset === option.key}
              onClick={() => {
                setPeriodPreset(option.key);
                setSelectedUserId(null);
              }}
            >
              {option.label}
            </StyledPeriodButton>
          ))}
        </StyledPeriodSelector>

        {usageByExecutionType.length > 0 && (
          <SubscriptionInfoContainer>
            <SettingsBillingLabelValueItem
              label={t`Usage by Type`}
              value={`${formatNumber(totalCredits)} total`}
            />
            <HorizontalSeparator
              noMargin
              color={theme.background.tertiary}
            />
            {usageByExecutionType.map((item, index) => {
              const percentage =
                totalCredits > 0
                  ? (item.creditsUsed / totalCredits) * 100
                  : 0;

              return (
                <StyledBarRow key={item.key}>
                  <StyledBarLabel>
                    <StyledLabelText>
                      {EXECUTION_TYPE_LABELS[item.key] ?? item.key}
                    </StyledLabelText>
                    <StyledValueText>
                      {formatNumber(item.creditsUsed)} (
                      {Math.round(percentage)}%)
                    </StyledValueText>
                  </StyledBarLabel>
                  <ProgressBar
                    value={percentage < 3 && percentage > 0 ? 3 : percentage}
                    barColor={barColors[index % barColors.length]}
                    backgroundColor={theme.background.tertiary}
                    withBorderRadius
                  />
                </StyledBarRow>
              );
            })}
          </SubscriptionInfoContainer>
        )}
      </Section>

      {displayTimeSeries.length > 0 && (
        <Section>
          <H2Title
            title={
              selectedUserId
                ? t`Daily Usage — ${selectedUserId}`
                : t`Daily Usage`
            }
            description={
              selectedUserId
                ? t`Per-day credit consumption for this user.`
                : t`Credit consumption over time.`
            }
          />
          {selectedUserId && (
            <StyledBackButton onClick={handleBackFromUser}>
              <IconArrowLeft size={14} />
              {t`Back to all users`}
            </StyledBackButton>
          )}
          <SubscriptionInfoContainer>
            <StyledTimeSeriesContainer>
              {displayTimeSeries.map((point) => (
                <StyledTimeSeriesBar
                  key={point.date}
                  height={`${(point.creditsUsed / maxTimeSeriesValue) * 100}%`}
                  color={theme.color.blue}
                />
              ))}
            </StyledTimeSeriesContainer>
            <StyledTimeSeriesLabels>
              {displayTimeSeries.length > 0 && (
                <StyledTimeSeriesLabel>
                  {formatShortDate(displayTimeSeries[0].date)}
                </StyledTimeSeriesLabel>
              )}
              {displayTimeSeries.length > 1 && (
                <StyledTimeSeriesLabel>
                  {formatShortDate(
                    displayTimeSeries[displayTimeSeries.length - 1].date,
                  )}
                </StyledTimeSeriesLabel>
              )}
            </StyledTimeSeriesLabels>
          </SubscriptionInfoContainer>
        </Section>
      )}

      {!selectedUserId && usageByUser.length > 0 && (
        <Section>
          <H2Title
            title={t`Usage by User`}
            description={t`Click a user to see their daily breakdown.`}
          />
          <SubscriptionInfoContainer>
            {usageByUser.map((item, index) => {
              const percentage =
                totalCredits > 0
                  ? (item.creditsUsed / totalCredits) * 100
                  : 0;

              return (
                <StyledClickableBarRow
                  key={item.key}
                  onClick={() => handleUserClick(item.key)}
                >
                  <StyledBarLabel>
                    <StyledLabelText>{item.key}</StyledLabelText>
                    <StyledValueText>
                      {formatNumber(item.creditsUsed)} credits
                    </StyledValueText>
                  </StyledBarLabel>
                  <ProgressBar
                    value={percentage < 3 && percentage > 0 ? 3 : percentage}
                    barColor={barColors[index % barColors.length]}
                    backgroundColor={theme.background.tertiary}
                    withBorderRadius
                  />
                </StyledClickableBarRow>
              );
            })}
          </SubscriptionInfoContainer>
        </Section>
      )}

      {!selectedUserId && usageByResource.length > 0 && (
        <Section>
          <H2Title
            title={t`Usage by Resource`}
            description={t`Credit consumption per agent or workflow.`}
          />
          <SubscriptionInfoContainer>
            {usageByResource.map((item, index) => {
              const percentage =
                totalCredits > 0
                  ? (item.creditsUsed / totalCredits) * 100
                  : 0;

              return (
                <StyledBarRow key={item.key}>
                  <StyledBarLabel>
                    <StyledLabelText>{item.key}</StyledLabelText>
                    <StyledValueText>
                      {formatNumber(item.creditsUsed)} credits
                    </StyledValueText>
                  </StyledBarLabel>
                  <ProgressBar
                    value={percentage < 3 && percentage > 0 ? 3 : percentage}
                    barColor={barColors[index % barColors.length]}
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
