import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreObjectOverviewWidget } from '@/object-core/components/CoreObjectOverviewWidget';
import { GraphWidgetAggregateChart } from '@/page-layout/widgets/graph/graph-widget-aggregate-chart/components/GraphWidgetAggregateChart';
import { AnimatedPlaceholder } from '@/ui/feedback/empty-state/components/AnimatedPlaceholder/AnimatedPlaceholder';
import { EmptyState } from '@/ui/feedback/empty-state/components/EmptyState';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';

const StyledOverview = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledStatGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledPanelGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
`;

type CoreObjectRunInsightsOverviewProps = {
  hasInsights: boolean;
  isLoading: boolean;
  hasError: boolean;
  stats: { title: string; value: string; suffix?: string }[];
  panels: { title: string; content: ReactNode }[];
};

export const CoreObjectRunInsightsOverview = ({
  hasInsights,
  isLoading,
  hasError,
  stats,
  panels,
}: CoreObjectRunInsightsOverviewProps) => {
  const { t } = useLingui();

  if (!hasInsights && isLoading) {
    return (
      <StyledOverview>
        <SkeletonLine height={96} />
        <SkeletonLine height={280} />
      </StyledOverview>
    );
  }

  if (!hasInsights) {
    return (
      <EmptyState.Root>
        <AnimatedPlaceholder type={hasError ? 'errorIndex' : 'emptyTimeline'} />
        <EmptyState.Content>
          <EmptyState.Title>{t`Could not load run insights`}</EmptyState.Title>
          <EmptyState.Description>{t`Try again in a moment`}</EmptyState.Description>
        </EmptyState.Content>
      </EmptyState.Root>
    );
  }

  return (
    <StyledOverview>
      <StyledStatGrid>
        {stats.map(({ title, value, suffix }) => (
          <CoreObjectOverviewWidget key={title} title={title}>
            <GraphWidgetAggregateChart value={value} suffix={suffix} />
          </CoreObjectOverviewWidget>
        ))}
      </StyledStatGrid>
      <StyledPanelGrid>
        {panels.map(({ title, content }) => (
          <CoreObjectOverviewWidget key={title} title={title}>
            {content}
          </CoreObjectOverviewWidget>
        ))}
      </StyledPanelGrid>
    </StyledOverview>
  );
};
