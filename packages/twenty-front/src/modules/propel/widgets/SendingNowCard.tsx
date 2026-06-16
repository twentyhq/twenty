import { Badge, Group, Progress, Stack, Text } from '@mantine/core';
import { IconBolt, IconMail, IconMessage } from 'twenty-ui/display';
import {
  type MarketingHubPayload,
  type SendingNowRow,
} from '@/propel/types/marketingHome';
import { WidgetCard } from '@/propel/components/WidgetCard';
import { EmptyState } from '@/propel/widgets/EmptyState';

const ChannelChip = ({ channel }: { channel: SendingNowRow['channel'] }) => {
  const Icon = channel === 'WHATSAPP' ? IconMessage : IconMail;
  return (
    <Badge
      size="xs"
      variant="light"
      color={channel === 'WHATSAPP' ? 'green' : 'blue'}
      radius="sm"
      leftSection={<Icon size={11} />}
    >
      {channel === 'WHATSAPP' ? 'WhatsApp' : 'Email'}
    </Badge>
  );
};

// Live "Sending now" board — campaigns currently materializing/sending. The hub
// caps the visible rows at 5 and reports the true count in sendingNowTotal. A
// targetCount of 0 means the audience is still materializing — show "Queued",
// never "0%".
export const SendingNowCard = ({
  hub,
  editMode,
}: {
  hub: MarketingHubPayload | null;
  editMode: boolean;
}) => {
  const rows = hub?.sendingNow ?? [];
  const total = hub?.sendingNowTotal ?? rows.length;

  return (
    <WidgetCard
      title="Sending now"
      Icon={IconBolt}
      editMode={editMode}
      headerRight={
        total > 0 ? (
          <Badge size="sm" variant="filled" color="red" radius="sm">
            {total} live
          </Badge>
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        <EmptyState message="Nothing is sending right now." Icon={IconBolt} />
      ) : (
        <Stack gap="sm" style={{ overflowY: 'auto', height: '100%' }}>
          {rows.map((row) => {
            const queued = row.targetCount === 0;
            const pct = queued
              ? 0
              : Math.min(
                  100,
                  Math.round((row.sentCount / row.targetCount) * 100),
                );
            return (
              <Stack key={row.id} gap={4}>
                <Group justify="space-between" gap="xs" wrap="nowrap">
                  <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                    <ChannelChip channel={row.channel} />
                    <Text
                      size="sm"
                      fw={600}
                      truncate
                      c="var(--mantine-color-text)"
                    >
                      {row.name}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                    {row.startedLabel}
                  </Text>
                </Group>
                {queued ? (
                  <Text size="xs" c="dimmed">
                    Queued — building audience…
                  </Text>
                ) : (
                  <>
                    <Progress value={pct} color="red" size="sm" radius="sm" />
                    <Group justify="space-between" gap="xs">
                      <Text size="xs" c="dimmed">
                        {row.sentCount.toLocaleString('en-US')} /{' '}
                        {row.targetCount.toLocaleString('en-US')} sent
                      </Text>
                      {row.failedCount > 0 && (
                        <Text size="xs" c="red">
                          {row.failedCount} failed
                        </Text>
                      )}
                    </Group>
                  </>
                )}
              </Stack>
            );
          })}
        </Stack>
      )}
    </WidgetCard>
  );
};
