import { Badge, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconBolt,
  type IconComponent,
  IconMail,
} from 'twenty-ui/display';
import {
  type AttentionRow,
  type MarketingHubPayload,
} from '@/propel/types/marketingHome';
import { WidgetCard } from '@/propel/components/WidgetCard';
import { EmptyState } from '@/propel/widgets/EmptyState';

const KIND_META: Record<
  AttentionRow['kind'],
  { Icon: IconComponent; color: string; label: string }
> = {
  FAILED_CAMPAIGN: { Icon: IconAlertTriangle, color: 'red', label: 'Failed' },
  HOT_REPLY: { Icon: IconBolt, color: 'orange', label: 'Hot reply' },
  DEAD_LETTER: { Icon: IconMail, color: 'gray', label: 'Stuck' },
};

// "Needs attention" — failed campaigns, hot replies, dead-letter sends from the
// hub route. Each row carries an operator-action line written server-side.
export const AttentionList = ({
  hub,
  editMode,
}: {
  hub: MarketingHubPayload | null;
  editMode: boolean;
}) => {
  const rows = hub?.needsAttention ?? [];

  return (
    <WidgetCard
      title="Needs attention"
      Icon={IconAlertTriangle}
      editMode={editMode}
      headerRight={
        rows.length > 0 ? (
          <Badge size="sm" variant="light" color="red" radius="sm">
            {rows.length}
          </Badge>
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        <EmptyState message="All clear — nothing needs your attention." />
      ) : (
        <Stack gap="sm" style={{ overflowY: 'auto', height: '100%' }}>
          {rows.map((row) => {
            const meta = KIND_META[row.kind];
            return (
              <Group key={row.id} gap="sm" wrap="nowrap" align="flex-start">
                <ThemeIcon
                  variant="light"
                  color={meta.color}
                  size="md"
                  radius="sm"
                >
                  <meta.Icon size={15} />
                </ThemeIcon>
                <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                  <Group justify="space-between" gap="xs" wrap="nowrap">
                    <Text
                      size="sm"
                      fw={600}
                      truncate
                      c="var(--mantine-color-text)"
                    >
                      {row.title}
                    </Text>
                    <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                      {row.whenLabel}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={2}>
                    {row.detail}
                  </Text>
                </Stack>
              </Group>
            );
          })}
        </Stack>
      )}
    </WidgetCard>
  );
};
