import {
  Alert,
  Anchor,
  Badge,
  Box,
  Button,
  Center,
  Drawer,
  Group,
  Loader,
  NavLink,
  Progress,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconRefresh,
} from 'twenty-ui/display';
import {
  fmtMoney,
  parseDetails,
  recordUrl,
  relDay,
} from '@/propel/lib/oneOnOneConfig';
import {
  useOneOnOneRunner,
  type RunnerGroups,
} from '@/propel/hooks/useOneOnOneRunner';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import { PipelinePill } from '@/propel/components/runner/PipelinePill';
import { type ReviewLine, type ReviewStatus } from '@/propel/types/oneOnOne';

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: 'DISCUSSED', label: 'Discussed' },
  { value: 'FLAGGED', label: 'Flag' },
  { value: 'STALLED', label: 'Stalled' },
];

// The Meeting Runner, as a real right-hand Drawer (the sandbox-freedom payoff —
// in-sandbox this had to be a whole separate record page deep-linked from the
// hub). Split-Focus master/detail: a grouped lead rail + the focused lead detail.
// Closing reports back so the hub can refetch its adherence/upcoming counts.
export const RunnerDrawer = ({
  meetingId,
  title,
  onClose,
}: {
  meetingId: string | null;
  title: string;
  onClose: (changed: boolean) => void;
}) => {
  const opened = meetingId !== null;
  return (
    <Drawer
      opened={opened}
      onClose={() => onClose(false)}
      position="right"
      size="min(960px, 92vw)"
      title={title}
      padding={0}
      styles={{
        body: { height: 'calc(100% - 60px)', padding: 0 },
        content: { display: 'flex', flexDirection: 'column' },
      }}
    >
      {opened ? <RunnerBody meetingId={meetingId} onClose={onClose} /> : null}
    </Drawer>
  );
};

const RunnerBody = ({
  meetingId,
  onClose,
}: {
  meetingId: string;
  onClose: (changed: boolean) => void;
}) => {
  const notify = usePropelToast();
  const runner = useOneOnOneRunner(meetingId);
  const [assessment, setAssessment] = useState('');

  if (runner.phase === 'generating') {
    const pct =
      runner.genTotal > 0
        ? Math.round((runner.genProcessed / runner.genTotal) * 100)
        : 0;
    return (
      <Center style={{ flex: 1 }} p="xl">
        <Stack gap="md" align="center" w="100%" maw={320}>
          <Loader color="red" />
          <Text size="sm" fw={600} ta="center">
            {runner.genTotal > 0
              ? `Loading leads… ${runner.genProcessed} / ${runner.genTotal}`
              : 'Preparing this agent’s leads…'}
          </Text>
          {runner.genTotal > 0 ? (
            <Progress value={pct} color="red" w="100%" radius="xl" />
          ) : null}
        </Stack>
      </Center>
    );
  }

  if (runner.phase === 'error') {
    return (
      <Center style={{ flex: 1 }} p="xl">
        <Stack gap="md" align="center">
          <Text size="sm" c="dimmed">
            Couldn&rsquo;t load this meeting&rsquo;s leads.
          </Text>
          <Button
            variant="default"
            leftSection={<IconRefresh size={14} />}
            onClick={runner.retry}
          >
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  if (runner.phase === 'wrapup') {
    const tasksToCreate = runner.lines.filter(
      (l) => (l.nextAction ?? '').trim() !== '',
    ).length;
    return (
      <ScrollArea style={{ flex: 1 }}>
        <Box p="xl" maw={760} mx="auto">
          <Stack gap="xl">
            <Text fz="lg" fw={700}>
              {runner.lines.length === 0
                ? 'No open leads to review this week.'
                : `All ${runner.lines.length} leads reviewed`}
            </Text>
            <Group grow align="stretch">
              <WrapStat n={runner.discussedCount} label="Discussed" />
              <WrapStat
                n={runner.groups.attn.length}
                label="Flagged / stalled"
                warn
              />
              <WrapStat n={tasksToCreate} label="Tasks to create" />
            </Group>
            <Textarea
              label="Manager assessment"
              placeholder="Overall assessment, themes, follow-ups…"
              autosize
              minRows={4}
              maxRows={12}
              value={assessment}
              onChange={(e) => setAssessment(e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button
                color="red"
                leftSection={<IconCheck size={16} />}
                loading={runner.completing}
                disabled={runner.completed}
                onClick={() => {
                  void runner.complete(assessment).then((res) => {
                    if (res !== null && res.error === undefined) {
                      const made = res.tasksCreated ?? 0;
                      notify(
                        `Meeting completed — ${made} task${
                          made === 1 ? '' : 's'
                        } created.`,
                        'success',
                      );
                      onClose(true);
                    } else {
                      notify(
                        res?.error ?? 'Could not complete the meeting.',
                        'error',
                      );
                    }
                  });
                }}
              >
                {runner.completed ? 'Completed' : 'Complete meeting'}
              </Button>
            </Group>
          </Stack>
        </Box>
      </ScrollArea>
    );
  }

  // ready — rail + detail
  return (
    <Group
      gap={0}
      align="stretch"
      wrap="nowrap"
      style={{ flex: 1, minHeight: 0 }}
    >
      <Box
        w={300}
        style={{
          flex: 'none',
          borderRight: '1px solid var(--mantine-color-default-border)',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box p="sm">
          <Text size="xs" c="dimmed" fw={600}>
            <Text span fw={700} c="var(--mantine-color-text)">
              Discussed {runner.discussedCount}
            </Text>{' '}
            / {runner.lines.length}
          </Text>
          <Progress
            mt={6}
            radius="xl"
            color="red"
            value={
              runner.lines.length > 0
                ? (runner.discussedCount / runner.lines.length) * 100
                : 0
            }
          />
        </Box>
        <ScrollArea style={{ flex: 1 }}>
          <LeadRail
            groups={runner.groups}
            currentId={runner.currentId}
            onSelect={runner.select}
          />
        </ScrollArea>
      </Box>

      <ScrollArea style={{ flex: 1, minWidth: 0 }}>
        {runner.current !== null ? (
          <LeadDetail
            line={runner.current}
            savingId={runner.savingId}
            remainingCount={runner.remainingCount}
            onSave={(patch) => runner.saveLine(runner.current!.id, patch)}
            onNext={runner.nextLead}
          />
        ) : (
          <Center h="100%" p="xl">
            <Text size="sm" c="dimmed">
              Select a lead from the list.
            </Text>
          </Center>
        )}
      </ScrollArea>
    </Group>
  );
};

const WrapStat = ({
  n,
  label,
  warn,
}: {
  n: number;
  label: string;
  warn?: boolean;
}) => (
  <Box
    p="md"
    style={{
      border: '1px solid var(--mantine-color-default-border)',
      borderRadius: 'var(--mantine-radius-md)',
      background: 'var(--mantine-color-body)',
    }}
  >
    <Text
      fz={28}
      fw={700}
      c={warn === true ? 'var(--mantine-color-yellow-7)' : undefined}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {n}
    </Text>
    <Text size="xs" c="dimmed" tt="uppercase" fw={600} mt={4}>
      {label}
    </Text>
  </Box>
);

const LeadRail = ({
  groups,
  currentId,
  onSelect,
}: {
  groups: RunnerGroups;
  currentId: string | null;
  onSelect: (id: string) => void;
}) => (
  <Box pb="sm">
    <RailGroup
      label={`Needs attention (${groups.attn.length})`}
      rows={groups.attn}
      currentId={currentId}
      onSelect={onSelect}
    />
    <RailGroup
      label={`Undiscussed (${groups.undisc.length})`}
      rows={groups.undisc}
      currentId={currentId}
      onSelect={onSelect}
    />
    <RailGroup
      label={`Discussed (${groups.done.length})`}
      rows={groups.done}
      currentId={currentId}
      onSelect={onSelect}
      dim
    />
  </Box>
);

const RailGroup = ({
  label,
  rows,
  currentId,
  onSelect,
  dim,
}: {
  label: string;
  rows: ReviewLine[];
  currentId: string | null;
  onSelect: (id: string) => void;
  dim?: boolean;
}) => {
  if (rows.length === 0) return null;
  return (
    <Box>
      <Text size="xs" c="dimmed" fw={600} tt="uppercase" px="sm" pt="sm" pb={4}>
        {label}
      </Text>
      {rows.map((l) => {
        const active = l.id === currentId;
        // NavLink is a real <a>/<button> — keyboard-activatable out of the box,
        // fixing the in-sandbox rail's missing keyboard activation (a11y bug the
        // graduation was meant to resolve).
        return (
          <NavLink
            key={l.id}
            active={active}
            color="red"
            variant="light"
            opacity={dim === true && !active ? 0.65 : 1}
            onClick={() => onSelect(l.id)}
            leftSection={
              l.discussed === true ? (
                <IconCheck size={14} color="var(--mantine-color-green-6)" />
              ) : l.closedSincePrep === true ? (
                <Box
                  w={7}
                  h={7}
                  style={{
                    borderRadius: 999,
                    background: 'var(--mantine-color-yellow-6)',
                  }}
                />
              ) : undefined
            }
            label={
              <Text size="sm" fw={active ? 600 : 500} truncate>
                {l.clientName ?? 'Lead'}
              </Text>
            }
            rightSection={
              dim !== true ? (
                <PipelinePill type={l.leadObjectType} small />
              ) : undefined
            }
          />
        );
      })}
    </Box>
  );
};

const LeadDetail = ({
  line,
  savingId,
  remainingCount,
  onSave,
  onNext,
}: {
  line: ReviewLine;
  savingId: string | null;
  remainingCount: number;
  onSave: (patch: Partial<ReviewLine>) => void;
  onNext: () => void;
}) => {
  const details = parseDetails(line.detailsSnapshot);
  const url = recordUrl(line);
  const hasValue =
    line.budgetSnapshot != null && line.budgetSnapshot.amountMicros != null;
  return (
    <Box p="xl" maw={760} mx="auto">
      <Stack gap="lg">
        <Group gap="sm" wrap="nowrap">
          <PipelinePill type={line.leadObjectType} />
          <Text fz="xl" fw={600} truncate style={{ minWidth: 0, flex: 1 }}>
            {line.clientName ?? 'Lead'}
          </Text>
          {url !== null ? (
            <Anchor
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              c="dimmed"
              style={{ flex: 'none', whiteSpace: 'nowrap' }}
            >
              <Group gap={4} wrap="nowrap">
                Open record <IconExternalLink size={13} />
              </Group>
            </Anchor>
          ) : null}
          <Badge
            size="sm"
            variant="light"
            color={savingId === line.id ? 'gray' : 'green'}
            style={{ flex: 'none' }}
          >
            {savingId === line.id ? 'Saving…' : 'Saved'}
          </Badge>
        </Group>

        {line.closedSincePrep === true ? (
          <Alert
            color="yellow"
            variant="light"
            icon={<IconAlertTriangle size={16} />}
          >
            This lead changed or closed since the meeting was prepared.
          </Alert>
        ) : null}

        <Box
          p="md"
          style={{
            border: '1px solid var(--mantine-color-default-border)',
            borderRadius: 'var(--mantine-radius-md)',
            background: 'var(--mantine-color-body)',
          }}
        >
          <Group align="flex-start" gap="xl" wrap="wrap">
            <SnapshotCell k="Stage" v={line.stageSnapshot} />
            {hasValue ? (
              <SnapshotCell
                k="Value"
                v={fmtMoney(line.budgetSnapshot ?? null)}
              />
            ) : null}
            <SnapshotCell k="Last activity" v={relDay(line.lastActivityAt)} />
            {details.length > 0
              ? details.map((d, i) => (
                  <SnapshotCell
                    key={`${d.label}-${i}`}
                    k={d.label}
                    v={d.value}
                  />
                ))
              : [
                  <SnapshotCell key="src" k="Source" v={line.sourceSnapshot} />,
                  <SnapshotCell
                    key="seg"
                    k="Segment"
                    v={line.segmentSnapshot}
                  />,
                ]}
          </Group>
        </Box>

        <Textarea
          label="Notes"
          autosize
          minRows={4}
          maxRows={16}
          defaultValue={line.notes ?? ''}
          onBlur={(e) => onSave({ notes: e.currentTarget.value })}
        />

        <TextInput
          label="Next action"
          defaultValue={line.nextAction ?? ''}
          onBlur={(e) => onSave({ nextAction: e.currentTarget.value })}
        />

        <Box>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb={6}>
            Status
          </Text>
          <SegmentedControl
            fullWidth
            color="red"
            value={line.lineStatus ?? 'PENDING'}
            onChange={(v) =>
              onSave({
                lineStatus: v as ReviewStatus,
                discussed: v === 'DISCUSSED',
              })
            }
            data={STATUS_OPTIONS}
          />
        </Box>

        <Group
          justify="space-between"
          pt="md"
          style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
        >
          <Text
            size="sm"
            c="dimmed"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {remainingCount} left to discuss
          </Text>
          <Button
            color="red"
            rightSection={<IconArrowRight size={16} />}
            onClick={onNext}
          >
            Next
          </Button>
        </Group>
      </Stack>
    </Box>
  );
};

const SnapshotCell = ({ k, v }: { k: string; v?: string | null }) => (
  <Box style={{ minWidth: 120 }}>
    <Text size="xs" c="dimmed" fw={600} tt="uppercase">
      {k}
    </Text>
    <Text size="sm" fw={500} style={{ overflowWrap: 'anywhere' }}>
      {v != null && v !== '' ? v : '—'}
    </Text>
  </Box>
);
