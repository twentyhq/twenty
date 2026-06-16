import {
  Box,
  Button,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconPlayerPlay,
  IconPlus,
} from 'twenty-ui/display';
import { type AgentBlock } from '@/propel/types/oneOnOne';

// The agent's own week: next 1:1 + open-lead count. "Open prep" / "Run" opens the
// Meeting Runner inline (the FE win — the in-sandbox version deep-linked away).
export const AgentHome = ({
  agent,
  weekLabel,
  onBook,
  onRunMeeting,
}: {
  agent: AgentBlock;
  weekLabel?: string | null;
  /** open the booking modal for the agent's own 1:1 */
  onBook: () => void;
  /** open the Runner drawer for a specific meeting */
  onRunMeeting: (meetingId: string, title: string) => void;
}) => (
  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
    <Card withBorder radius="lg" padding="lg">
      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
        Your next 1:1
      </Text>
      {agent.nextMeeting !== null ? (
        <Stack gap="sm" mt="xs">
          <Box>
            <Text
              fz={26}
              fw={700}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {agent.nextMeeting.whenLabel}
            </Text>
            <Text size="sm" c="dimmed">
              with {agent.nextMeeting.managerLabel}
              {agent.nextMeeting.durationMinutes != null
                ? ` · ${agent.nextMeeting.durationMinutes} min`
                : ''}
            </Text>
          </Box>
          <Group gap="sm">
            <Button
              color="red"
              rightSection={<IconArrowRight size={16} />}
              onClick={() =>
                onRunMeeting(
                  agent.nextMeeting!.meetingId,
                  `1:1 with ${agent.nextMeeting!.managerLabel}`,
                )
              }
            >
              Open prep
            </Button>
            <Button variant="default" onClick={onBook}>
              Reschedule
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="sm" mt="xs">
          <Box>
            <Text fz={26} fw={700}>
              None yet
            </Text>
            <Text size="sm" c="dimmed">
              {agent.manager !== null
                ? `Book your weekly 1:1 with ${agent.manager.label}`
                : 'No manager assigned yet — booking falls back to a manual pick'}
            </Text>
          </Box>
          <Group>
            <Button
              color="red"
              leftSection={<IconPlus size={16} />}
              onClick={onBook}
            >
              Book a 1:1
            </Button>
          </Group>
          {agent.manager === null ? (
            <Text size="xs" c="dimmed">
              You don&rsquo;t have a manager assigned yet, so you won&rsquo;t
              appear in a team command-center until one claims you.
            </Text>
          ) : null}
        </Stack>
      )}
    </Card>

    <Card withBorder radius="lg" padding="lg">
      <Text size="xs" c="dimmed" fw={600} tt="uppercase">
        {weekLabel != null && weekLabel !== ''
          ? `Week of ${weekLabel}`
          : 'Your book'}
      </Text>
      <Text
        fz={40}
        fw={700}
        mt="xs"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {agent.openLeads}
      </Text>
      <Text size="sm" c="dimmed">
        open leads across all pipelines
      </Text>
      {agent.openLeads === 0 ? (
        <Text size="sm" c="dimmed" mt="md">
          No open leads right now — a 1:1 can still happen to plan the week
          ahead.
        </Text>
      ) : agent.nextMeeting !== null ? (
        <Group mt="md">
          <Button
            variant="default"
            rightSection={<IconArrowUpRight size={14} />}
            onClick={() =>
              onRunMeeting(
                agent.nextMeeting!.meetingId,
                `1:1 with ${agent.nextMeeting!.managerLabel}`,
              )
            }
          >
            Review list
          </Button>
        </Group>
      ) : (
        <Group mt="md">
          <Button
            variant="default"
            leftSection={<IconPlayerPlay size={14} />}
            onClick={onBook}
          >
            Book a 1:1 to review them
          </Button>
        </Group>
      )}
    </Card>
  </SimpleGrid>
);
