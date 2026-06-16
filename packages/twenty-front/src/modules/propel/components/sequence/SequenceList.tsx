import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Menu,
  Stack,
  Text,
} from '@mantine/core';
import { useCallback, useState } from 'react';
import {
  IconArchive,
  IconArrowsSplit2,
  IconDotsVertical,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
} from 'twenty-ui/display';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import {
  type SequenceAction,
  type SequenceRow,
} from '@/propel/types/sequenceEditor';
import {
  ENTRY_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
} from '@/propel/lib/sequenceEditorConfig';
import { transitionSequence } from '@/propel/lib/sequenceActions';

// All sequences as a card list with lifecycle controls — the in-sandbox surface put
// activate/pause on the unified Campaigns row; here the sequence list owns its own
// lifecycle so the editor stays focused on authoring. ARCHIVED sequences are
// terminal: shown greyed, no actions. Counts (active/enrolled) are the route's real
// totals — never fabricated; a fresh draft really has 0.

const channelSummary = (s: SequenceRow): string => {
  const types = new Set(s.steps.map((st) => st.stepType));
  const parts: string[] = [];
  if (types.has('SEND_EMAIL')) parts.push('Email');
  if (types.has('SEND_WHATSAPP')) parts.push('WhatsApp');
  return parts.length ? parts.join(' + ') : 'No sends yet';
};

export const SequenceList = ({
  sequences,
  onNew,
  onEdit,
  onMutated,
}: {
  sequences: SequenceRow[];
  onNew: () => void;
  onEdit: (s: SequenceRow) => void;
  onMutated: () => void;
}) => {
  const notify = usePropelToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const runAction = useCallback(
    async (s: SequenceRow, action: SequenceAction) => {
      if (busyId) return;
      setBusyId(s.id);
      const res = await transitionSequence(s.id, action);
      setBusyId(null);
      if (!res || res.ok !== true) {
        notify(
          res?.operatorAction ||
            res?.error ||
            (res?.errors?.length ? res.errors.join('; ') : `Could not ${action} the sequence.`),
          'error',
        );
        return;
      }
      const msg: Record<SequenceAction, string> = {
        activate: 'Sequence activated.',
        pause: 'Sequence paused.',
        archive: 'Sequence archived.',
        stop_everyone: `Everyone removed — ${res.exitedEnrollments ?? 0} enrollment${
          res.exitedEnrollments === 1 ? '' : 's'
        } stopped.`,
      };
      notify(msg[action], 'success');
      onMutated();
    },
    [busyId, notify, onMutated],
  );

  if (sequences.length === 0) {
    return (
      <Center mih={320}>
        <Stack gap="md" align="center" maw={420}>
          <IconArrowsSplit2 size={36} stroke={1.4} color="var(--mantine-color-dimmed)" />
          <Text size="sm" c="dimmed" ta="center">
            No sequences yet. Build a multi-step follow-up that emails, waits,
            branches on what people do, and creates call tasks — automatically, for
            everyone you enroll.
          </Text>
          <Button
            color="red"
            leftSection={<IconPlus size={14} />}
            onClick={onNew}
          >
            New sequence
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      {sequences.map((s) => {
        const terminal = s.status === 'ARCHIVED';
        const running = s.status === 'RUNNING';
        const busy = busyId === s.id;
        return (
          <Card
            key={s.id}
            withBorder
            radius="md"
            padding="md"
            style={{
              background: 'var(--mantine-color-body)',
              opacity: terminal ? 0.6 : 1,
            }}
          >
            <Group justify="space-between" wrap="nowrap" gap="md">
              <Stack
                gap={4}
                style={{ minWidth: 0, cursor: 'pointer', flex: 1 }}
                onClick={() => onEdit(s)}
              >
                <Group gap="xs" wrap="nowrap">
                  <Text fw={700} size="sm" truncate>
                    {s.name || 'Untitled sequence'}
                  </Text>
                  <Badge size="sm" variant="light" color={STATUS_COLOR[s.status] ?? 'gray'}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  {s.steps.length} step{s.steps.length === 1 ? '' : 's'} ·{' '}
                  {channelSummary(s)} · {ENTRY_LABEL[s.entryType]} ·{' '}
                  {s.activeCount} active / {s.enrolledCount} enrolled
                </Text>
              </Stack>

              <Group gap="xs" wrap="nowrap">
                {!terminal && !running ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="teal"
                    leftSection={<IconPlayerPlay size={14} />}
                    loading={busy}
                    onClick={() => void runAction(s, 'activate')}
                  >
                    Activate
                  </Button>
                ) : null}
                {running ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="yellow"
                    leftSection={<IconPlayerPause size={14} />}
                    loading={busy}
                    onClick={() => void runAction(s, 'pause')}
                  >
                    Pause
                  </Button>
                ) : null}

                {!terminal ? (
                  <Menu position="bottom-end" withinPortal shadow="md">
                    <Menu.Target>
                      <ActionIcon variant="default" aria-label="More actions" disabled={busy}>
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {running || s.status === 'PAUSED' ? (
                        <Menu.Item
                          leftSection={<IconPlayerStop size={14} />}
                          onClick={() => void runAction(s, 'stop_everyone')}
                        >
                          Stop &amp; remove everyone
                        </Menu.Item>
                      ) : null}
                      <Menu.Item
                        color="red"
                        leftSection={<IconArchive size={14} />}
                        onClick={() => void runAction(s, 'archive')}
                      >
                        Archive
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                ) : null}
              </Group>
            </Group>
          </Card>
        );
      })}

      <Button
        variant="light"
        color="gray"
        leftSection={<IconPlus size={14} />}
        onClick={onNew}
        style={{ alignSelf: 'flex-start' }}
      >
        New sequence
      </Button>
    </Stack>
  );
};
