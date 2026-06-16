import { ResponsiveLine } from '@nivo/line';
import { IconChartLine } from 'twenty-ui/display';
import { type MarketingAnalyticsPayload } from '@/propel/types/marketingHome';
import { WidgetCard } from '@/propel/components/WidgetCard';
import { channelColor, propelNivoTheme } from '@/propel/lib/nivoTheme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { EmptyState } from '@/propel/widgets/EmptyState';

// Sends-over-time line chart. ONLY rendered when analytics.trend.present is true
// (the route emits this once ≥2 days carry data). Draws a total "All" line plus a
// thin per-channel overlay (EMAIL / WHATSAPP) aligned to the same day buckets.
export const TrendChart = ({
  analytics,
  editMode,
}: {
  analytics: MarketingAnalyticsPayload | null;
  editMode: boolean;
}) => {
  const trend = analytics?.trend;

  if (trend === undefined || trend.present !== true) {
    return (
      <WidgetCard title="Sends over time" Icon={IconChartLine} editMode={editMode}>
        <EmptyState message="Not enough data yet — the trend appears once at least two days have sends." />
      </WidgetCard>
    );
  }

  const series = trend.value.series;
  const labels = series.map((p) => p.label);

  const allSeries = {
    id: 'All',
    color: themeCssVariables.color.red,
    data: series.map((p) => ({ x: p.label, y: p.value })),
  };

  const channelSeries = trend.value.byChannel.map((ch) => ({
    id: ch.channel === 'WHATSAPP' ? 'WhatsApp' : 'Email',
    color: channelColor(ch.channel),
    data: labels.map((label, idx) => ({ x: label, y: ch.values[idx] ?? 0 })),
  }));

  const data = [allSeries, ...channelSeries];

  return (
    <WidgetCard title="Sends over time" Icon={IconChartLine} editMode={editMode}>
      <div style={{ height: '100%', minHeight: 180 }}>
        <ResponsiveLine
          data={data}
          theme={propelNivoTheme}
          colors={(serie) => (serie as { color: string }).color}
          margin={{ top: 16, right: 16, bottom: 56, left: 40 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
          curve="monotoneX"
          enableArea={false}
          enablePoints={false}
          enableGridX={false}
          lineWidth={2}
          axisBottom={{
            tickSize: 0,
            tickPadding: 8,
            tickRotation: labels.length > 8 ? -45 : 0,
          }}
          axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 4 }}
          useMesh
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              translateY: 48,
              itemWidth: 80,
              itemHeight: 16,
              symbolSize: 10,
              symbolShape: 'circle',
            },
          ]}
          animate={false}
        />
      </div>
    </WidgetCard>
  );
};
