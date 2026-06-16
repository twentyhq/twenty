import { ResponsivePie } from '@nivo/pie';
import { IconChartPie } from 'twenty-ui/display';
import { type MarketingAnalyticsPayload } from '@/propel/types/marketingHome';
import { WidgetCard } from '@/propel/components/WidgetCard';
import { channelColor, propelNivoTheme } from '@/propel/lib/nivoTheme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { EmptyState } from '@/propel/widgets/EmptyState';

// Donut of sends split by channel (analytics.channels — only channels with
// sent > 0 in the window are present). Empty until at least one channel has sends.
export const ChannelSplit = ({
  analytics,
  editMode,
}: {
  analytics: MarketingAnalyticsPayload | null;
  editMode: boolean;
}) => {
  const channels = (analytics?.channels ?? []).filter((c) => c.sent > 0);

  if (channels.length === 0) {
    return (
      <WidgetCard title="Channel mix" Icon={IconChartPie} editMode={editMode}>
        <EmptyState message="No sends in this window yet." />
      </WidgetCard>
    );
  }

  const data = channels.map((c) => ({
    id: c.channel === 'WHATSAPP' ? 'WhatsApp' : 'Email',
    label: c.channel === 'WHATSAPP' ? 'WhatsApp' : 'Email',
    value: c.sent,
    color: channelColor(c.channel),
  }));

  return (
    <WidgetCard title="Channel mix" Icon={IconChartPie} editMode={editMode}>
      <div style={{ height: '100%', minHeight: 180 }}>
        <ResponsivePie
          data={data}
          theme={propelNivoTheme}
          colors={(slice) => (slice.data as { color: string }).color}
          margin={{ top: 16, right: 16, bottom: 40, left: 16 }}
          innerRadius={0.6}
          padAngle={1}
          cornerRadius={3}
          activeOuterRadiusOffset={6}
          borderWidth={0}
          enableArcLinkLabels={false}
          arcLabelsTextColor={themeCssVariables.font.color.inverted}
          arcLabel={(d) => `${d.value}`}
          legends={[
            {
              anchor: 'bottom',
              direction: 'row',
              translateY: 32,
              itemWidth: 90,
              itemHeight: 16,
              symbolSize: 10,
              symbolShape: 'circle',
              itemTextColor: themeCssVariables.font.color.secondary,
            },
          ]}
          animate={false}
        />
      </div>
    </WidgetCard>
  );
};
