// Fork-local port of propel-crm-integration's src/shared/sequence-step-helpers.ts
// (step-type catalog, blank-step factory, flow-step title) plus the entry/condition
// option lists the in-sandbox SequenceEditor declared inline. Pure data + pure
// functions — no I/O, no cross-repo import. Kept 1:1 with the in-sandbox surface so
// the editor behaves identically; only the rendering moves to Mantine + React Flow.

import {
  type ConditionKind,
  type EntryType,
  type SequenceStepDraft,
  type StepType,
} from '@/propel/types/sequenceEditor';

// Only firstName is fillable for a segment-based send (no listing context), so a WA
// template is "segment-safe" only when every one of its params is in this set. 1:1
// with the in-sandbox SEGMENT_SAFE_PARAMS (BUILDER_MERGE_FIELDS).
export const SEGMENT_SAFE_PARAMS: ReadonlySet<string> = new Set<string>([
  'firstName',
]);

export const STEP_TYPE_OPTIONS: { value: StepType; label: string }[] = [
  { value: 'SEND_EMAIL', label: 'Send an email' },
  { value: 'SEND_WHATSAPP', label: 'Send a WhatsApp message' },
  { value: 'WAIT', label: 'Wait a few days' },
  { value: 'CONDITION', label: 'Check what they did (branch)' },
  { value: 'CREATE_TASK', label: 'Create a call task for the agent' },
  { value: 'EXIT', label: 'End the sequence' },
];

export const SEQ_ENTRY_OPTIONS: { value: EntryType; label: string }[] = [
  { value: 'MANUAL', label: "I'll enroll people myself" },
  { value: 'SEGMENT_POLL', label: 'Auto-enroll everyone in a segment' },
  { value: 'EVENT', label: 'Triggered by an event (advanced)' },
];

export const CONDITION_OPTIONS: {
  value: ConditionKind;
  label: string;
  pill: string;
}[] = [
  { value: 'OPENED', label: 'open the email?', pill: 'Opened' },
  { value: 'CLICKED', label: 'click a link?', pill: 'Clicked' },
  { value: 'REPLIED', label: 'reply?', pill: 'Replied' },
];

export const blankStep = (stepType: StepType): SequenceStepDraft => ({
  name: '',
  stepType,
  channel:
    stepType === 'SEND_WHATSAPP'
      ? 'WHATSAPP'
      : stepType === 'SEND_EMAIL'
        ? 'EMAIL'
        : null,
  waitDays: stepType === 'WAIT' ? 3 : null,
  templateSubject: null,
  templateBody: null,
  conditionKind: stepType === 'CONDITION' ? 'OPENED' : null,
  whatsappTemplateId: null,
  whatsappLanguageCode: stepType === 'SEND_WHATSAPP' ? 'EN' : null,
  yesStepIndex: null,
  noStepIndex: null,
});

export const flowStepTitle = (s: SequenceStepDraft, i: number): string => {
  const base =
    s.name.trim() ||
    (s.stepType === 'WAIT'
      ? `wait ${s.waitDays ?? 0} day${(s.waitDays ?? 0) === 1 ? '' : 's'}`
      : s.stepType === 'CONDITION'
        ? `did they ${(s.conditionKind ?? 'OPENED')
            .toLowerCase()
            .replace('opened', 'open?')
            .replace('clicked', 'click?')
            .replace('replied', 'reply?')}`
        : s.stepType === 'EXIT'
          ? 'end sequence'
          : s.stepType === 'CREATE_TASK'
            ? 'call task for agent'
            : s.templateSubject?.trim() || `step ${i + 1}`);
  return base.length > 24 ? `${base.slice(0, 23)}…` : base;
};

export const STEP_TYPE_LABEL: Record<StepType, string> = {
  SEND_EMAIL: 'Email',
  SEND_WHATSAPP: 'WhatsApp',
  WAIT: 'Wait',
  CONDITION: 'Branch',
  CREATE_TASK: 'Call task',
  EXIT: 'End',
};

export const ENTRY_LABEL: Record<EntryType, string> = {
  MANUAL: 'Manual enrollment',
  SEGMENT_POLL: 'Auto-enroll a segment',
  EVENT: 'Event-triggered',
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  RUNNING: 'Running',
  PAUSED: 'Paused',
  ARCHIVED: 'Archived',
};

// Mantine theme color per status badge (red is the brand primary).
export const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'gray',
  RUNNING: 'teal',
  PAUSED: 'yellow',
  ARCHIVED: 'gray',
};

export const isSequenceEditable = (status: string): boolean =>
  status === 'DRAFT' || status === 'PAUSED';

// Remove a step from the array, fixing branch-target indices (the wire format).
// A target AT the removed index drops to null; a target PAST it shifts down one.
// Byte-for-byte the in-sandbox removeStep remap.
export const removeStepAt = (
  steps: SequenceStepDraft[],
  i: number,
): SequenceStepDraft[] =>
  steps
    .filter((_, j) => j !== i)
    .map((s) => ({
      ...s,
      yesStepIndex:
        s.yesStepIndex == null || s.yesStepIndex === i
          ? null
          : s.yesStepIndex > i
            ? s.yesStepIndex - 1
            : s.yesStepIndex,
      noStepIndex:
        s.noStepIndex == null || s.noStepIndex === i
          ? null
          : s.noStepIndex > i
            ? s.noStepIndex - 1
            : s.noStepIndex,
    }));

// Swap a step with its neighbour in `dir` direction, remapping branch targets that
// pointed at either swapped index. Byte-for-byte the in-sandbox moveStep remap.
export const moveStepAt = (
  steps: SequenceStepDraft[],
  i: number,
  dir: -1 | 1,
): SequenceStepDraft[] => {
  const j = i + dir;
  if (j < 0 || j >= steps.length) return steps;
  const remap = (idx: number | null) => (idx === i ? j : idx === j ? i : idx);
  const next = [...steps];
  [next[i], next[j]] = [next[j], next[i]];
  return next.map((s) => ({
    ...s,
    yesStepIndex: remap(s.yesStepIndex),
    noStepIndex: remap(s.noStepIndex),
  }));
};

export const clampInt = (v: number, lo: number, hi: number): number =>
  Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : lo;

// The pure validation list — mirrors the in-sandbox `problems` memo exactly so the
// editor refuses to save the same illegal states the route would reject anyway.
export const validateSequence = (
  name: string,
  entryType: EntryType,
  entrySegmentId: string,
  steps: SequenceStepDraft[],
): string[] => {
  const out: string[] = [];
  if (!name.trim()) out.push('Give the sequence a name.');
  if (entryType === 'SEGMENT_POLL' && !entrySegmentId)
    out.push('Pick which segment auto-enrolls.');
  if (steps.length === 0) out.push('Add at least one step.');
  steps.forEach((s, i) => {
    if (s.stepType === 'SEND_EMAIL' && !(s.templateSubject ?? '').trim())
      out.push(`Step ${i + 1}: the email needs a subject.`);
    if (s.stepType === 'SEND_EMAIL' && !(s.templateBody ?? '').trim())
      out.push(`Step ${i + 1}: write the message.`);
    if (s.stepType === 'SEND_WHATSAPP' && !s.whatsappTemplateId)
      out.push(`Step ${i + 1}: pick a WhatsApp template.`);
    if (s.stepType === 'WAIT' && (s.waitDays == null || s.waitDays < 0))
      out.push(`Step ${i + 1}: how many days to wait?`);
    if (s.stepType === 'CONDITION' && !s.conditionKind)
      out.push(`Step ${i + 1}: choose what to check.`);
  });
  return out;
};
