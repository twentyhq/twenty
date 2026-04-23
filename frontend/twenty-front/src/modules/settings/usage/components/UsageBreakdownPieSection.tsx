import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { UsagePieChart } from '@/settings/usage/components/UsagePieChart';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageAnalyticsData } from '@/settings/usage/hooks/useUsageAnalyticsData';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { getOperationTypeLabel } from '@/settings/usage/utils/getOperationTypeLabel';
import { Select } from '@/ui/input/components/Select';
import { useContext } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { type UsageOperationType } from '~/generated-metadata/graphql';

type UsageBreakdownField = 'operationType' | 'model';

type UsageBreakdownPieSectionProps = {
  title: string;
  description?: string;
  operationTypes?: UsageOperationType[];
  userWorkspaceId?: string;
  skip?: boolean;
  breakdownField: UsageBreakdownField;
  sectionId: string;
};

export const UsageBreakdownPieSection = ({
  title,
  description,
  operationTypes,
  userWorkspaceId,
  skip,
  breakdownField,
  sectionId,
}: UsageBreakdownPieSectionProps) => {
  const { theme } = useContext(ThemeContext);
  const { formatUsageValue } = useUsageValueFormatter();
  const colorRegistry = createGraphColorRegistry(theme.color);

  const { analytics, isInitialLoading, period, setPeriod, periodOptions } =
    useUsageAnalyticsData({
      operationTypes,
      userWorkspaceId,
      skip,
    });

  if (isInitialLoading) {
    return <UsageSectionSkeleton />;
  }

  if (!analytics) {
    return null;
  }

  const breakdownData =
    breakdownField === 'operationType'
      ? analytics.usageByOperationType
      : analytics.usageByModel;

  if (breakdownData.length === 0) {
    return null;
  }

  const total = breakdownData.reduce((sum, item) => sum + item.creditsUsed, 0);

  const formatLabel =
    breakdownField === 'operationType'
      ? getOperationTypeLabel
      : (key: string) => key;

  const pieData = breakdownData.map((item, index) => ({
    id: formatLabel(item.key),
    value: item.creditsUsed,
    color: getColorSchemeByIndex(colorRegistry, index).solid,
  }));

  const resolvedDescription = description ?? formatUsageValue(total);

  return (
    <Section>
      <H2Title
        title={title}
        description={resolvedDescription}
        adornment={
          <Select
            dropdownId={`${sectionId}-period`}
            value={period}
            options={periodOptions}
            onChange={setPeriod}
            needIconCheck
            selectSizeVariant="small"
          />
        }
      />
      <SubscriptionInfoContainer>
        <UsagePieChart data={pieData} />
      </SubscriptionInfoContainer>
    </Section>
  );
};
