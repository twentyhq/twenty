import { useActivityHeatmapData } from '@/activities/timeline-activities/hooks/useActivityHeatmapData';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { styled } from '@linaria/react';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledHeatmapContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  height: 160px;
  margin-bottom: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

type ActivityHeatmapProps = {
  timelineActivities: TimelineActivity[];
};

export const ActivityHeatmap = ({
  timelineActivities,
}: ActivityHeatmapProps) => {
  const { theme } = useContext(ThemeContext);
  const { data, from, to } = useActivityHeatmapData(timelineActivities);

  if (data.length === 0) {
    return null;
  }

  return (
    <StyledHeatmapContainer>
      <ResponsiveCalendar
        data={data}
        from={from}
        to={to}
        emptyColor={theme.background.tertiary}
        colors={[
          theme.color.blue3,
          theme.color.blue5,
          theme.color.blue7,
          theme.color.blue9,
        ]}
        margin={{ top: 20, right: 20, bottom: 0, left: 20 }}
        yearSpacing={40}
        monthBorderColor={theme.background.primary}
        dayBorderWidth={2}
        dayBorderColor={theme.background.primary}
        monthLegendOffset={10}
        theme={{
          labels: {
            text: {
              fontSize: 11,
              fill: theme.font.color.tertiary,
            },
          },
          tooltip: {
            container: {
              background: theme.background.primary,
              color: theme.font.color.primary,
              fontSize: 12,
              borderRadius: theme.border.radius.sm,
              boxShadow: theme.boxShadow.light,
            },
          },
        }}
      />
    </StyledHeatmapContainer>
  );
};
