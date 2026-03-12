import { SettingsBillingLabelValueItem } from '@/billing/components/internal/SettingsBillingLabelValueItem';
import { SubscriptionInfoContainer } from '@/billing/components/SubscriptionInfoContainer';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { H2Title, HorizontalSeparator } from 'twenty-ui/display';
import { ProgressBar } from 'twenty-ui/feedback';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useGetBillingAnalyticsQuery } from '~/generated-metadata/graphql';

const EXECUTION_TYPE_LABELS: Record<string, string> = {
  ai_token: 'AI Tokens',
  workflow_execution: 'Workflow Execution',
  code_execution: 'Code Execution',
};

const BAR_COLORS = [
  '#1961ED',
  '#6C5CE7',
  '#00B894',
  '#E17055',
  '#FDCB6E',
  '#74B9FF',
];

const StyledBarRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
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

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} 0;
  text-align: center;
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

// __SCREENSHOT_MOCK_START__ (remove for production)
const MOCK_DATA = {
  usageByExecutionType: [
    { key: 'ai_token', creditsUsed: 12450 },
    { key: 'workflow_execution', creditsUsed: 3280 },
    { key: 'code_execution', creditsUsed: 870 },
  ],
  usageByUser: [
    { key: 'Tim Cook', creditsUsed: 8200 },
    { key: 'Jony Ive', creditsUsed: 5100 },
    { key: 'Craig Federighi', creditsUsed: 3300 },
  ],
  usageByResource: [
    { key: 'Sales Assistant Agent', creditsUsed: 6400 },
    { key: 'Lead Qualification Workflow', creditsUsed: 4200 },
    { key: 'Data Enrichment Agent', creditsUsed: 3800 },
    { key: 'Email Drip Workflow', creditsUsed: 2200 },
  ],
  timeSeries: Array.from({ length: 28 }, (_, i) => ({
    date: new Date(2026, 1, 13 + i).toISOString().slice(0, 10),
    creditsUsed: Math.round(300 + Math.random() * 800 + (i > 14 ? 200 : 0)),
  })),
};
// __SCREENSHOT_MOCK_END__

export const SettingsBillingAnalyticsSection = () => {
  const { theme } = useContext(ThemeContext);
  const { formatNumber } = useNumberFormat();

  const { data, loading } = useGetBillingAnalyticsQuery();

  // Use real data if available, otherwise use mock for preview
  const analyticsData =
    data?.getBillingAnalytics &&
    (data.getBillingAnalytics.usageByExecutionType.length > 0 ||
      data.getBillingAnalytics.usageByUser.length > 0 ||
      data.getBillingAnalytics.usageByResource.length > 0)
      ? data.getBillingAnalytics
      : MOCK_DATA;

  const { usageByUser, usageByResource, usageByExecutionType, timeSeries } =
    analyticsData;

  const hasAnalyticsData =
    usageByExecutionType.length > 0 ||
    usageByUser.length > 0 ||
    usageByResource.length > 0;

  if (loading) {
    return null;
  }

  if (!hasAnalyticsData) {
    return null;
  }

  const totalCredits = usageByExecutionType.reduce(
    (sum, item) => sum + item.creditsUsed,
    0,
  );

  const maxTimeSeriesValue = Math.max(
    ...timeSeries.map((point) => point.creditsUsed),
    1,
  );

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);

    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Usage Analytics`}
          description={t`Detailed breakdown of your credit usage this billing period.`}
        />

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
                    barColor={BAR_COLORS[index % BAR_COLORS.length]}
                    backgroundColor={theme.background.tertiary}
                    withBorderRadius
                  />
                </StyledBarRow>
              );
            })}
          </SubscriptionInfoContainer>
        )}
      </Section>

      {timeSeries.length > 0 && (
        <Section>
          <H2Title
            title={t`Daily Usage`}
            description={t`Credit consumption over time.`}
          />
          <SubscriptionInfoContainer>
            <StyledTimeSeriesContainer>
              {timeSeries.map((point) => (
                <StyledTimeSeriesBar
                  key={point.date}
                  height={`${(point.creditsUsed / maxTimeSeriesValue) * 100}%`}
                  color={theme.color.blue}
                />
              ))}
            </StyledTimeSeriesContainer>
            <StyledTimeSeriesLabels>
              {timeSeries.length > 0 && (
                <StyledTimeSeriesLabel>
                  {formatShortDate(timeSeries[0].date)}
                </StyledTimeSeriesLabel>
              )}
              {timeSeries.length > 1 && (
                <StyledTimeSeriesLabel>
                  {formatShortDate(timeSeries[timeSeries.length - 1].date)}
                </StyledTimeSeriesLabel>
              )}
            </StyledTimeSeriesLabels>
          </SubscriptionInfoContainer>
        </Section>
      )}

      {usageByUser.length > 0 && (
        <Section>
          <H2Title
            title={t`Usage by User`}
            description={t`Credit consumption per team member.`}
          />
          <SubscriptionInfoContainer>
            {usageByUser.map((item, index) => {
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
                    barColor={BAR_COLORS[index % BAR_COLORS.length]}
                    backgroundColor={theme.background.tertiary}
                    withBorderRadius
                  />
                </StyledBarRow>
              );
            })}
          </SubscriptionInfoContainer>
        </Section>
      )}

      {usageByResource.length > 0 && (
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
                    barColor={BAR_COLORS[index % BAR_COLORS.length]}
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
