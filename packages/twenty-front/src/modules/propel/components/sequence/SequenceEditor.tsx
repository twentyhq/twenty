import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useCallback, useMemo, useState } from 'react';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconPlus,
  IconSend,
} from 'twenty-ui/display';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import { SequenceFlowMap } from '@/propel/components/sequence/SequenceFlowMap';
import { StepEditorCard } from '@/propel/components/sequence/StepEditorCard';
import {
  type EntryType,
  type SegmentOption,
  type SequenceRow,
  type SequenceStepDraft,
  type StepType,
  type WaTemplateOption,
} from '@/propel/types/sequenceEditor';
import {
  SEGMENT_SAFE_PARAMS,
  SEQ_ENTRY_OPTIONS,
  blankStep,
  flowStepTitle,
  isSequenceEditable,
  moveStepAt,
  removeStepAt,
  validateSequence,
} from '@/propel/lib/sequenceEditorConfig';
import {
  saveSequence,
  testSendSequence,
} from '@/propel/lib/sequenceActions';

// The graduated Sequence Editor body (P3 hero #4). A sequence is a step graph run
// per enrolled person: send / wait / branch (opened/clicked/replied) / call-task /
// end. Two panes: the dense Mantine step rail (edit) on the left, the React Flow
// node-graph (the canvas the sandbox structurally denied) on the right. Editing is
// allowed only in DRAFT/PAUSED — the route enforces it too; RUNNING/ARCHIVED open
// read-only. Branch targets are sibling INDICES (the save route resolves them to ids
// after the wholesale step replacement).

const addStepType = (steps: SequenceStepDraft[]): StepType =>
  steps.some((s) => s.stepType === 'SEND_EMAIL') ? 'WAIT' : 'SEND_EMAIL';

export const SequenceEditor = ({
  initial,
  segments,
  waTemplates,
  onBack,
  onSaved,
}: {
  initial: SequenceRow | null;
  segments: SegmentOption[];
  waTemplates: WaTemplateOption[];
  onBack: () => void;
  onSaved: () => void;
}) => {
  const notify = usePropelToast();
  const editable = initial == null || isSequenceEditable(initial.status);

  // Only approved, segment-safe templates can send to an enrolled segment (no
  // listing context → only firstName fills), 1:1 with the in-sandbox filter.
  const waOptions = useMemo(
    () =>
      waTemplates.filter(
        (t) => t.approved && t.paramMap.every((p) => SEGMENT_SAFE_PARAMS.has(p)),
      ),
    [waTemplates],
  );

  const [name, setName] = useState(initial?.name ?? '');
  const [entryType, setEntryType] = useState<EntryType>(
    initial?.entryType ?? 'MANUAL',
  );
  const [entrySegmentId, setEntrySegmentId] = useState<string>(
    initial?.entrySegmentId ?? '',
  );
  const [steps, setSteps] = useState<SequenceStepDraft[]>(
    initial?.steps?.length ? initial.steps : [blankStep('SEND_EMAIL')],
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const patchStep = useCallback(
    (i: number, patch: Partial<SequenceStepDraft>) =>
      setSteps((prev) => prev.map((s, j) => (j === i ? { ...s, ...patch } : s))),
    [],
  );
  const replaceType = useCallback(
    (i: number, next: StepType) =>
      setSteps((prev) =>
        prev.map((s, j) =>
          j === i
            ? {
                ...blankStep(next),
                name: s.name,
                templateSubject: s.templateSubject,
                templateBody: s.templateBody,
              }
            : s,
        ),
      ),
    [],
  );
  const removeStep = useCallback((i: number) => {
    setSteps((prev) => removeStepAt(prev, i));
    setSelectedIndex((sel) =>
      sel == null ? null : sel === i ? Math.max(0, i - 1) : sel > i ? sel - 1 : sel,
    );
  }, []);
  const moveStep = useCallback((i: number, dir: -1 | 1) => {
    setSteps((prev) => moveStepAt(prev, i, dir));
    setSelectedIndex((sel) => (sel === i ? i + dir : sel));
  }, []);
  const addStep = useCallback(() => {
    setSteps((prev) => {
      const next = [...prev, blankStep(addStepType(prev))];
      setSelectedIndex(next.length - 1);
      return next;
    });
  }, []);

  const problems = useMemo(
    () => validateSequence(name, entryType, entrySegmentId, steps),
    [name, entryType, entrySegmentId, steps],
  );

  // Branch-target options for a CONDITION step: "(continue in order)" + every OTHER
  // step by index — the index is the wire format the save route consumes.
  const branchOptions = useCallback(
    (selfIdx: number) => [
      { value: '', label: '(continue in order)' },
      ...steps.map((s, i) => ({
        value: String(i),
        label: `Step ${i + 1} — ${flowStepTitle(s, i)}`,
        disabled: i === selfIdx,
      })),
    ],
    [steps],
  );

  const save = useCallback(async () => {
    if (saving || problems.length > 0 || !editable) return;
    setSaving(true);
    const res = await saveSequence({
      sequenceId: initial?.id,
      name,
      entryType,
      entrySegmentId,
      steps,
    });
    setSaving(false);
    if (!res || res.error || !res.sequenceId) {
      notify(
        res?.operatorAction || res?.error || 'Could not save the sequence.',
        'error',
      );
      return;
    }
    notify(
      initial ? 'Sequence saved.' : 'Sequence created — activate it when ready.',
      'success',
    );
    onSaved();
  }, [
    saving,
    problems.length,
    editable,
    initial,
    name,
    entryType,
    entrySegmentId,
    steps,
    notify,
    onSaved,
  ]);

  // Test send only works on a SAVED sequence (the route reads the persisted steps),
  // so it's disabled until there's an id and only sends the first email step.
  const runTestSend = useCallback(async () => {
    if (!initial?.id || testing) return;
    setTesting(true);
    const res = await testSendSequence(initial.id);
    setTesting(false);
    if (!res || res.ok !== true) {
      notify(
        res?.operatorAction ||
          res?.error ||
          res?.testSend?.espError ||
          'Test send failed.',
        'error',
      );
      return;
    }
    notify(
      `Test email sent to ${res.testSend?.to ?? 'you'} — “${
        res.testSend?.subject ?? ''
      }”`,
      'success',
    );
  }, [initial?.id, testing, notify]);

  return (
    <Stack gap="md" style={{ minHeight: 0 }}>
      <Group justify="space-between" wrap="nowrap">
        <Button
          size="xs"
          variant="default"
          leftSection={<IconArrowLeft size={14} />}
          onClick={onBack}
        >
          All sequences
        </Button>
        <Group gap="xs" wrap="nowrap">
          {initial ? (
            <Badge variant="light" color="gray" size="lg">
              {initial.activeCount} active / {initial.enrolledCount} enrolled
            </Badge>
          ) : null}
          {initial?.id ? (
            <Button
              size="xs"
              variant="default"
              leftSection={<IconSend size={14} />}
              loading={testing}
              onClick={() => void runTestSend()}
            >
              Test send
            </Button>
          ) : null}
          {editable ? (
            <Button
              size="xs"
              color="red"
              leftSection={<IconDeviceFloppy size={14} />}
              loading={saving}
              disabled={problems.length > 0}
              onClick={() => void save()}
            >
              {initial ? 'Save sequence' : 'Create sequence'}
            </Button>
          ) : (
            <Badge variant="light" color="gray" size="lg">
              {initial?.status} — read only
            </Badge>
          )}
        </Group>
      </Group>

      <Alert color="gray" variant="light" radius="md" p="sm">
        <Text size="xs" c="dimmed">
          A sequence is an automatic follow-up plan: it works through the steps below
          for each enrolled person, one at a time. Anyone who replies leaves
          immediately and becomes a call task. Send rules (weekly caps, quiet hours)
          always apply.
        </Text>
      </Alert>

      <Grid gutter="md">
        {/* setup + step rail */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Card withBorder radius="md" padding="md">
              <Stack gap="sm">
                <TextInput
                  size="sm"
                  label="Sequence name"
                  disabled={!editable}
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder='e.g. "New buyer lead follow-up"'
                />
                <Select
                  size="sm"
                  label="Who gets enrolled"
                  disabled={!editable}
                  value={entryType}
                  data={SEQ_ENTRY_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                  comboboxProps={{ withinPortal: true }}
                  allowDeselect={false}
                  onChange={(value) => {
                    if (value) setEntryType(value as EntryType);
                  }}
                />
                {entryType === 'SEGMENT_POLL' ? (
                  <Select
                    size="sm"
                    label="Segment to auto-enroll"
                    disabled={!editable}
                    value={entrySegmentId}
                    placeholder="Pick a segment…"
                    data={segments.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.lastResolvedLabel})`,
                    }))}
                    comboboxProps={{ withinPortal: true }}
                    onChange={(value) => setEntrySegmentId(value ?? '')}
                  />
                ) : null}
              </Stack>
            </Card>

            <Stack gap="xs">
              <Text size="sm" fw={700} c="var(--mantine-color-text)">
                Steps
              </Text>
              {steps.map((s, i) => (
                <StepEditorCard
                  key={i}
                  step={s}
                  index={i}
                  total={steps.length}
                  editable={editable}
                  selected={selectedIndex === i}
                  waOptions={waOptions}
                  branchOptions={branchOptions(i)}
                  onSelect={() => setSelectedIndex(i)}
                  onPatch={(patch) => patchStep(i, patch)}
                  onReplaceType={(next) => replaceType(i, next)}
                  onMove={(dir) => moveStep(i, dir)}
                  onRemove={() => removeStep(i)}
                />
              ))}
              {editable ? (
                <Button
                  size="xs"
                  variant="light"
                  color="gray"
                  leftSection={<IconPlus size={14} />}
                  onClick={addStep}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Add a step
                </Button>
              ) : null}
            </Stack>

            {editable && problems.length > 0 ? (
              <Alert color="yellow" variant="light" radius="md" title="Before you save">
                <Stack gap={2}>
                  {problems.map((p, i) => (
                    <Text key={i} size="xs" c="yellow.8">
                      • {p}
                    </Text>
                  ))}
                </Stack>
              </Alert>
            ) : null}
          </Stack>
        </Grid.Col>

        {/* flow map (the graduated canvas) */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md" padding="xs" style={{ position: 'sticky', top: 8 }}>
            <Group justify="space-between" px={6} pt={4} pb={6}>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Flow map
              </Text>
              <Text size="xs" c="dimmed">
                {steps.length} step{steps.length === 1 ? '' : 's'}
              </Text>
            </Group>
            <Box style={{ height: 460 }}>
              <SequenceFlowMap
                steps={steps}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            </Box>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};
