import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { IconChartBar } from 'twenty-ui/display';
import { type MarketingAnalyticsPayload } from '@/propel/types/marketingHome';
import { WidgetCard } from '@/propel/components/WidgetCard';
import { EmptyState } from '@/propel/widgets/EmptyState';

// Sent → delivered(proxy) → opened → clicked → replied as horizontal bars, each
// scaled to the funnel head (sent). The route may flag the delivered stage as a
// proxy (sent − bounced); we surface that honestly with a small "est." badge.
export const FunnelCard = ({
  analytics,
  editMode,
}: {
  analytics: MarketingAnalyticsPayload | null;
  editMode: boolean;
}) => {
  const stages = analytics?.funnel?.stages ?? [];
  const head = stages[0]?.count ?? 0;

  if (stages.length === 0 || head === 0) {
    return (
      <WidgetCard title="Funnel" Icon={IconChartBar} editMode={editMode}>
        <EmptyState message="No campaign activity in this window yet." />
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Funnel" Icon={IconChartBar} editMode={editMode}>
      <Stack gap="sm">
        {stages.map((stage) => {
          const pct = head > 0 ? Math.round((stage.count / head) * 100) : 0;
          return (
            <Stack key={stage.key} gap={2}>
              <Group justify="space-between" gap="xs" wrap="nowrap">
                <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" truncate>
                    {stage.label}
                  </Text>
                  {stage.isProxy === true && (
                    <Badge size="xs" variant="light" color="gray" radius="sm">
                      est.
                    </Badge>
                  )}
                </Group>
                <Text size="xs" fw={600} c="var(--mantine-color-text)">
                  {stage.count.toLocaleString('en-US')}
                  {stage.ratePct != null ? ` · ${stage.ratePct}%` : ''}
                </Text>
              </Group>
              <Progress value={pct} color="red" size="md" radius="sm" />
            </Stack>
          );
        })}
      </Stack>
    </WidgetCard>
  );
};
