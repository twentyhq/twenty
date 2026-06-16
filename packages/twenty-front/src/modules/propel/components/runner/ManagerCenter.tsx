import {
  Anchor,
  Badge,
  Button,
  Card,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import {
  IconCalendar,
  IconPlayerPlay,
  IconPlus,
  IconUserPlus,
} from 'twenty-ui/display';
import { OOO_DAYS } from '@/propel/lib/oneOnOneConfig';
import { type ManagerBlock } from '@/propel/types/oneOnOne';

// The manager command-center: team adherence, the team roster (real Mantine
// Table, button rows for un-booked agents), the manager's own 1:1 hours, and the
// upcoming rail with an inline "Run" that opens the Runner drawer.
export const ManagerCenter = ({
  block,
  onManageTeam,
  onBookAgent,
  onRunMeeting,
}: {
  block: ManagerBlock;
  onManageTeam: () => void;
  onBookAgent: (agent: { id: string; label: string }) => void;
  onRunMeeting: (meetingId: string, title: string) => void;
}) => {
  const a = block.adherence;
  const hours = block.availability;
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <Stack gap="lg">
        <Card withBorder radius="lg" padding="lg">
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            Team adherence
          </Text>
          <Group align="baseline" gap="sm" mt="xs" wrap="wrap">
            <Text
              fz={44}
              fw={700}
              lh={1}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {a.pct}
              <Text span fz={20} c="dimmed">
                %
              </Text>
            </Text>
            <Text
              size="sm"
              c="dimmed"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {a.bookedNum} of {a.bookedDen} booked · {a.held} held · {a.missed}{' '}
              missed
            </Text>
          </Group>
          <Progress mt="md" radius="xl" color="red" value={a.pct} />
          <Group gap="xs" mt="md">
            <Badge variant="light" color="gray">
              {a.reviewed} reviewed
            </Badge>
            <Badge variant="light" color="yellow">
              {a.flagged} flagged
            </Badge>
            <Badge variant="light" color="gray">
              {a.stalled} stalled
            </Badge>
          </Group>
        </Card>

        <Card withBorder radius="lg" padding="lg">
          <Group justify="space-between" mb="sm">
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Your team
            </Text>
            <Button
              size="compact-sm"
              variant="default"
              leftSection={<IconUserPlus size={14} />}
              onClick={onManageTeam}
            >
              Add agent
            </Button>
          </Group>
          {block.team.length === 0 ? (
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                No direct reports yet. Add the agents who report to you and
                they&rsquo;ll appear here — with booking status, flagged leads,
                and last 1:1 at a glance.
              </Text>
              <Group>
                <Button
                  color="red"
                  leftSection={<IconUserPlus size={16} />}
                  onClick={onManageTeam}
                >
                  Add your first agent
                </Button>
              </Group>
            </Stack>
          ) : (
            <Table verticalSpacing="sm" fz="sm" layout="fixed">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Agent</Table.Th>
                  <Table.Th ta="center" w={70}>
                    Booked
                  </Table.Th>
                  <Table.Th ta="center" w={56}>
                    Held
                  </Table.Th>
                  <Table.Th ta="center" w={70}>
                    Flagged
                  </Table.Th>
                  <Table.Th ta="right" w={80}>
                    Last 1:1
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {block.team.map((t) => (
                  <Table.Tr key={t.agentId}>
                    <Table.Td>
                      <Text size="sm" fw={500} truncate>
                        {t.label}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      {t.booked ? (
                        <Text span c="green" fw={700}>
                          ●
                        </Text>
                      ) : (
                        <Button
                          size="compact-xs"
                          variant="light"
                          color="red"
                          onClick={() =>
                            onBookAgent({ id: t.agentId, label: t.label })
                          }
                        >
                          Book
                        </Button>
                      )}
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text span c={t.held ? 'green' : 'dimmed'}>
                        {t.held ? '●' : '○'}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="center">
                      <Text
                        span
                        fw={t.flagged >= 3 ? 700 : 400}
                        c={t.flagged >= 3 ? 'yellow.7' : undefined}
                      >
                        {t.flagged > 0 ? t.flagged : '—'}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      {t.lastOneOnOne != null && t.lastOneOnOne !== '' ? (
                        <Text span size="sm" c="dimmed">
                          {t.lastOneOnOne}
                        </Text>
                      ) : (
                        <Text span size="xs" c="red" fw={600}>
                          never
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
          {block.needsBooking.length > 0 ? (
            <Group gap="xs" mt="md">
              <Text size="xs" c="dimmed">
                Needs booking:
              </Text>
              {block.needsBooking.map((n) => (
                <Button
                  key={n.agentId}
                  size="compact-xs"
                  variant="subtle"
                  color="red"
                  leftSection={<IconPlus size={12} />}
                  onClick={() => onBookAgent({ id: n.agentId, label: n.label })}
                >
                  {n.label}
                </Button>
              ))}
            </Group>
          ) : null}
        </Card>
      </Stack>

      <Stack gap="lg">
        <Card withBorder radius="lg" padding="lg">
          <Text size="xs" c="dimmed" fw={600} tt="uppercase">
            Your 1:1 hours
          </Text>
          {hours.length > 0 ? (
            <Group gap="xs" mt="sm">
              {hours.map((w, i) => (
                <Badge
                  key={w.id ?? `${w.dayOfWeek}-${i}`}
                  variant="default"
                  radius="sm"
                  size="lg"
                >
                  {OOO_DAYS.find((d) => d.v === w.dayOfWeek)?.short ??
                    w.dayOfWeek}{' '}
                  {w.startTime}–{w.endTime}
                </Badge>
              ))}
            </Group>
          ) : (
            <Text size="sm" c="dimmed" mt="sm">
              No 1:1 hours set yet — agents can&rsquo;t book until you add some
              in Settings.
            </Text>
          )}
          {hours.length > 0 ? (
            <Text size="xs" c="dimmed" mt="sm">
              {hours[0]?.slotMinutes ?? 45}-min slots
              {typeof block.openSlotCount === 'number'
                ? ` · ${block.openSlotCount} open this week`
                : ''}
            </Text>
          ) : null}
        </Card>

        <Card withBorder radius="lg" padding="lg">
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb="sm">
            Upcoming
          </Text>
          {block.upcoming.length === 0 ? (
            <Text size="sm" c="dimmed">
              No 1:1s booked this week yet.
            </Text>
          ) : (
            <Stack gap={0}>
              {block.upcoming.map((m, idx) => (
                <Group
                  key={m.meetingId}
                  justify="space-between"
                  wrap="nowrap"
                  py="sm"
                  style={{
                    borderTop:
                      idx === 0
                        ? undefined
                        : '1px solid var(--mantine-color-default-border)',
                  }}
                >
                  <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Text
                      size="xs"
                      c="dimmed"
                      w={84}
                      style={{
                        flex: 'none',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {m.whenLabel}
                    </Text>
                    <Text size="sm" fw={500} truncate>
                      {m.agentLabel}
                    </Text>
                  </Group>
                  <Button
                    size="compact-sm"
                    variant="light"
                    color="red"
                    leftSection={<IconPlayerPlay size={13} />}
                    onClick={() =>
                      onRunMeeting(m.meetingId, `1:1 — ${m.agentLabel}`)
                    }
                  >
                    Run
                  </Button>
                </Group>
              ))}
            </Stack>
          )}
        </Card>

        <Card
          withBorder
          radius="lg"
          padding="md"
          bg="var(--mantine-color-body)"
        >
          <Group gap="sm" wrap="nowrap">
            <IconCalendar size={18} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              Manage your weekly 1:1 hours and direct reports from the
              one-on-one settings — they feed the booking slots above.
            </Text>
            <Anchor href="/settings/profile" size="xs" style={{ flex: 'none' }}>
              Settings
            </Anchor>
          </Group>
        </Card>
      </Stack>
    </SimpleGrid>
  );
};
