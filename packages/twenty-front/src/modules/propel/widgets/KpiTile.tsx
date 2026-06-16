import { Badge, Group, Stack, Text } from '@mantine/core';
import { IconTrendingDown, IconTrendingUp } from 'twenty-ui/display';
import { type Metric } from '@/propel/types/marketingHome';
import { WidgetCard } from '@/propel/components/WidgetCard';

// A single headline KPI (Sent / Open rate / Replies / Revenue). Renders the figure
// big, with a period-over-period delta pill ONLY when the route supplies a
// comparable base (deltaPct !== null — never a delta off a zero base).
export const KpiTile = ({
  title,
  metric,
  format = 'number',
  editMode,
}: {
  title: string;
  metric: Metric | undefined;
  format?: 'number' | 'percent' | 'currency';
  editMode: boolean;
}) => {
  const value = metric?.value ?? 0;
  const deltaPct = metric?.deltaPct ?? null;

  const formatted =
    format === 'percent'
      ? `${value}%`
      : format === 'currency'
        ? `AED ${value.toLocaleString('en-US')}`
        : value.toLocaleString('en-US');

  const deltaUp = deltaPct !== null && deltaPct >= 0;

  return (
    <WidgetCard title={title} editMode={editMode}>
      <Stack gap={6} justify="center" h="100%">
        <Text fw={700} fz={30} lh={1.1} c="var(--mantine-color-text)">
          {formatted}
        </Text>
        {deltaPct !== null && (
          <Group gap={4}>
            <Badge
              variant="light"
              color={deltaUp ? 'green' : 'red'}
              size="sm"
              radius="sm"
              leftSection={
                deltaUp ? (
                  <IconTrendingUp size={12} />
                ) : (
                  <IconTrendingDown size={12} />
                )
              }
            >
              {Math.abs(deltaPct)}%
            </Badge>
            <Text size="xs" c="dimmed">
              vs prior period
            </Text>
          </Group>
        )}
      </Stack>
    </WidgetCard>
  );
};
