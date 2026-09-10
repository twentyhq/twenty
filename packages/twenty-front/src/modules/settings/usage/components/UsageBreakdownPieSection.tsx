import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { getColorSchemeByIndex } from '@/page-layout/widgets/graph/utils/getColorSchemeByIndex';
import { SubscriptionInfoContainer } from '@/settings/billing/components/SubscriptionInfoContainer';
import { UsagePieChart } from '@/settings/usage/components/UsagePieChart';
import { UsageSectionSkeleton } from '@/settings/usage/components/UsageSectionSkeleton';
import { useUsageAnalyticsData } from '@/settings/usage/hooks/useUsageAnalyticsData';
import { useUsageValueFormatter } from '@/settings/usage/hooks/useUsageValueFormatter';
import { getUsageOperationTypeLabel } from '@/settings/usage/utils/getUsageOperationTypeLabel';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { type UsageOperationType } from '~/generated-metadata/graphql';

type UsageBreakdownField = 'operationType' | 'application' | 'model';

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
  const { t } = useLingui();
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

  const breakdownDataByField = {
    operationType: analytics.usageByOperationType,
    application: analytics.usageByApplication,
    model: analytics.usageByModel,
  };
  const breakdownData = breakdownDataByField[breakdownField];

  if (breakdownData.length === 0) {
    return null;
  }

  const total = breakdownData.reduce((sum, item) => sum + item.creditsUsed, 0);

  // Operation types are a fixed platform vocabulary translated here; the other
  // breakdowns name workspace data, which only the server can resolve.
  const formatLabel = ({
    key,
    label,
  }: {
    key: string;
    label?: string | null;
  }) => {
    if (breakdownField !== 'operationType') {
      return label ?? key;
    }

    const operationTypeLabel = getUsageOperationTypeLabel(key);

    return isDefined(operationTypeLabel) ? t(operationTypeLabel) : key;
  };

  const pieData = breakdownData.map((item, index) => ({
    id: formatLabel(item),
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
