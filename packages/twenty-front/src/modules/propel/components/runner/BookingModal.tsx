import {
  Alert,
  Box,
  Button,
  Center,
  Chip,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconCheck, IconClock } from 'twenty-ui/display';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import {
  currentWeekMonday,
  dayLabel,
  timeLabel,
} from '@/propel/lib/oneOnOneConfig';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import {
  type AvailableSlotsResponse,
  type BookMeetingResponse,
  type Slot,
} from '@/propel/types/oneOnOne';

type Phase = 'loading' | 'slots' | 'noAvailability' | 'booking' | 'error';

// Real Mantine Modal (focus-trapped, escape-closeable) porting the in-sandbox
// PickerSheet. Reuses the EXISTING /one-on-one/available-slots + /book-meeting
// routes verbatim — books a slot on `manager`'s hours for `agentId`. Two modes:
// a manager booking on behalf of a report (forLabel set) or an agent self-book.
export const BookingModal = ({
  agentId,
  manager,
  forLabel,
  onClose,
}: {
  /** the workspaceMember the meeting is FOR (the report, or the agent themselves) */
  agentId: string | null;
  /** whose 1:1 hours to book against */
  manager: { id: string; label: string } | null;
  /** report's name when a manager books on their behalf; null = agent self-book */
  forLabel?: string | null;
  onClose: (booked: boolean) => void;
}) => {
  const opened = agentId !== null;
  const notify = usePropelToast();
  const weekStartIso = useMemo(currentWeekMonday, []);
  const [phase, setPhase] = useState<Phase>('loading');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const loadSlots = useCallback(
    async (managerId: string) => {
      setPhase('loading');
      const res = await callPropelRoute<AvailableSlotsResponse>(
        '/one-on-one/available-slots',
        { managerId, weekStartIso },
      );
      const s = res?.slots ?? [];
      setSlots(s);
      setPhase(
        s.length > 0 ? 'slots' : res === null ? 'error' : 'noAvailability',
      );
    },
    [weekStartIso],
  );

  useEffect(() => {
    if (!opened) return;
    setSelected(null);
    if (manager?.id != null && manager.id !== '') void loadSlots(manager.id);
    else setPhase('error');
  }, [opened, manager, loadSlots]);

  const book = useCallback(async () => {
    if (manager?.id == null || selected === null || agentId === null) return;
    setPhase('booking');
    const res = await callPropelRoute<BookMeetingResponse>(
      '/one-on-one/book-meeting',
      {
        managerId: manager.id,
        agentId,
        slotStartIso: selected,
        weekStartIso,
      },
    );
    if (
      res === null ||
      res.error !== undefined ||
      res.meetingId === undefined
    ) {
      notify(res?.error ?? 'Could not book that slot.', 'error');
      void loadSlots(manager.id); // a race may have taken it
      return;
    }
    notify(
      forLabel != null && forLabel !== ''
        ? `1:1 booked for ${forLabel}`
        : 'Weekly 1:1 booked',
      'success',
    );
    onClose(true);
  }, [
    manager,
    selected,
    agentId,
    weekStartIso,
    forLabel,
    notify,
    loadSlots,
    onClose,
  ]);

  const grouped = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) {
      const k = dayLabel(s.startAtIso);
      const arr = m.get(k) ?? [];
      arr.push(s);
      m.set(k, arr);
    }
    return [...m.entries()];
  }, [slots]);

  const heading =
    forLabel != null && forLabel !== ''
      ? `Book a 1:1 for ${forLabel}`
      : 'Book your weekly 1:1';

  return (
    <Modal
      opened={opened}
      onClose={() => onClose(false)}
      title={heading}
      size="lg"
      centered
      closeOnClickOutside={phase !== 'booking'}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {forLabel != null && forLabel !== '' ? (
            <>
              for <b>{forLabel}</b> · on your hours
            </>
          ) : (
            <>
              with <b>{manager?.label ?? '—'}</b>
              {manager !== null ? ' · auto-selected' : ''}
            </>
          )}
        </Text>

        {phase === 'loading' ? (
          <Center py="xl">
            <Loader color="red" size="sm" />
          </Center>
        ) : null}

        {phase === 'error' ? (
          <Alert color="red" variant="light">
            Couldn&rsquo;t load slots. Close and try again — or ask your manager
            to set 1:1 hours.
          </Alert>
        ) : null}

        {phase === 'noAvailability' ? (
          <Alert color="gray" variant="light">
            No open slots for the week of {weekStartIso}. Ask{' '}
            {manager?.label ?? 'your manager'} to add 1:1 hours.
          </Alert>
        ) : null}

        {phase === 'slots' || phase === 'booking'
          ? grouped.map(([day, daySlots]) => (
              <Box key={day}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={8}>
                  {day}
                </Text>
                <Chip.Group
                  multiple={false}
                  value={selected}
                  onChange={(v) => setSelected(v as string)}
                >
                  <Group gap="xs">
                    {daySlots.map((s) => (
                      <Chip key={s.startAtIso} value={s.startAtIso} color="red">
                        {timeLabel(s.startAtIso)}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              </Box>
            ))
          : null}

        {phase === 'slots' || phase === 'booking' ? (
          <Group
            justify="space-between"
            pt="sm"
            style={{
              borderTop: '1px solid var(--mantine-color-default-border)',
            }}
          >
            <Group gap={6} c="dimmed">
              <IconClock size={14} />
              <Text size="sm" c="dimmed">
                {selected !== null
                  ? `${dayLabel(selected)}, ${timeLabel(selected)} selected`
                  : 'Pick a slot'}
              </Text>
            </Group>
            <Button
              color="red"
              leftSection={<IconCheck size={16} />}
              disabled={selected === null}
              loading={phase === 'booking'}
              onClick={() => void book()}
            >
              Confirm booking
            </Button>
          </Group>
        ) : null}
      </Stack>
    </Modal>
  );
};
