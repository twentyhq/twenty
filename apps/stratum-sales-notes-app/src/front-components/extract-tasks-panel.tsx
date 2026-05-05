import { memo, useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';

import { EXTRACT_TASKS_PANEL_UID } from 'src/constants/universal-identifiers';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProposedTask = {
  taskId: string;
  title: string;
  body: string;
  dueAt: string | null;
  rationale: string;
};

type SalesNoteSnapshot = {
  bodyMarkdown: string;
  createdAt: string | null;
  attendeePersonIds: string[];
  companyId: string | null;
  opportunityId: string | null;
  ownerId: string | null;
};

type TaskRelations = {
  taskTargetIds: string[]; // for diagnostics; not used downstream
  personIds: Set<string>;
  companyIds: Set<string>;
  opportunityIds: Set<string>;
  salesNoteIds: Set<string>;
};

// ─── HTTP helpers (kept top-level so JSX is small + sandbox-safe) ────────────

const getApiConfig = () => {
  const baseUrl = process.env.TWENTY_API_URL ?? '';
  const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  const aiUrl = baseUrl.endsWith('/graphql')
    ? baseUrl.replace(/\/graphql$/, '/rest/ai/generate-text')
    : `${baseUrl}/rest/ai/generate-text`;
  const token = process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY ?? '';
  return { apiUrl, aiUrl, token };
};

const graphqlFetch = async (query: string, variables: Record<string, unknown>) => {
  const { apiUrl, token } = getApiConfig();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await response.json()) as { data?: unknown; errors?: { message: string }[] };
  if (json.errors && json.errors.length > 0) throw new Error(json.errors[0].message);
  return json.data;
};

const fetchSalesNoteSnapshot = async (id: string): Promise<SalesNoteSnapshot> => {
  const data = (await graphqlFetch(
    `query GetSalesNoteForExtraction($id: UUID!) {
       salesNote(filter: { id: { eq: $id } }) {
         body { markdown }
         createdAt
         companyId
         opportunityId
         ownerId
         attendees { edges { node { personId } } }
       }
     }`,
    { id },
  )) as {
    salesNote?: {
      body?: { markdown?: string | null } | null;
      createdAt?: string | null;
      companyId?: string | null;
      opportunityId?: string | null;
      ownerId?: string | null;
      attendees?: { edges?: { node?: { personId?: string | null } | null }[] | null } | null;
    } | null;
  };
  const sn = data?.salesNote;
  if (!sn) throw new Error('Call report not found');
  const attendeePersonIds: string[] = [];
  for (const edge of sn.attendees?.edges ?? []) {
    const pid = edge?.node?.personId;
    if (typeof pid === 'string' && pid.length > 0) attendeePersonIds.push(pid);
  }
  return {
    bodyMarkdown: sn.body?.markdown ?? '',
    createdAt: sn.createdAt ?? null,
    attendeePersonIds,
    companyId: sn.companyId ?? null,
    opportunityId: sn.opportunityId ?? null,
    ownerId: sn.ownerId ?? null,
  };
};

// Existing DRAFT tasks linked to a salesNote.
//
// The TaskFilterInput schema does NOT expose `taskTargets` as a filterable
// field (verified against the UAT introspection on 2026-05-05), so we cannot
// filter `tasks` by their nested taskTargets. Two-step query instead:
//   1. taskTargets where targetSalesNoteId = $id, distinct taskIds
//   2. tasks where id IN those + status=DRAFT (in code, since `status` filter
//      doesn't accept `in`-style multi-values on this build)
//
// Returns ProposedTask[] ready for the panel state.
const fetchExistingDraftsForSalesNote = async (
  salesNoteId: string,
): Promise<ProposedTask[]> => {
  const targetData = (await graphqlFetch(
    `query DraftTaskTargetsForSalesNote($id: UUID!) {
       taskTargets(filter: { targetSalesNoteId: { eq: $id } }, first: 100) {
         edges { node { taskId } }
       }
     }`,
    { id: salesNoteId },
  )) as {
    taskTargets?: {
      edges?: { node?: { taskId?: string | null } | null }[] | null;
    } | null;
  };

  const taskIdSet = new Set<string>();
  for (const edge of targetData?.taskTargets?.edges ?? []) {
    const tid = edge?.node?.taskId;
    if (typeof tid === 'string' && tid.length > 0) taskIdSet.add(tid);
  }
  if (taskIdSet.size === 0) return [];

  // Fetch each task; filter for DRAFT in code. This is N round-trips but
  // typically N is tiny (≤ a handful per sales note) and we don't need to
  // page; the alternative would be a hand-built `or` filter list.
  const drafts: ProposedTask[] = [];
  for (const taskId of taskIdSet) {
    const taskData = (await graphqlFetch(
      `query GetTaskForDraftCheck($id: UUID!) {
         task(filter: { id: { eq: $id } }) {
           id
           title
           status
           dueAt
           bodyV2 { markdown }
         }
       }`,
      { id: taskId },
    )) as {
      task?: {
        id?: string;
        title?: string | null;
        status?: string | null;
        dueAt?: string | null;
        bodyV2?: { markdown?: string | null } | null;
      } | null;
    };
    const t = taskData?.task;
    if (!t || t.status !== 'DRAFT' || typeof t.id !== 'string') continue;
    drafts.push({
      taskId: t.id,
      title: t.title ?? '',
      body: t.bodyV2?.markdown ?? '',
      dueAt: t.dueAt ?? null,
      rationale: '',
    });
  }
  return drafts;
};

// Read a task's existing taskTargets so Finalise can compute which relations
// still need to be added vs the live salesNote snapshot.
const fetchTaskTargets = async (taskId: string): Promise<TaskRelations> => {
  const data = (await graphqlFetch(
    `query TaskTargetsForFinalise($id: UUID!) {
       taskTargets(filter: { taskId: { eq: $id } }, first: 200) {
         edges {
           node {
             id
             targetPersonId
             targetCompanyId
             targetOpportunityId
             targetSalesNoteId
           }
         }
       }
     }`,
    { id: taskId },
  )) as {
    taskTargets?: {
      edges?: {
        node?: {
          id?: string | null;
          targetPersonId?: string | null;
          targetCompanyId?: string | null;
          targetOpportunityId?: string | null;
          targetSalesNoteId?: string | null;
        } | null;
      }[] | null;
    } | null;
  };

  const out: TaskRelations = {
    taskTargetIds: [],
    personIds: new Set<string>(),
    companyIds: new Set<string>(),
    opportunityIds: new Set<string>(),
    salesNoteIds: new Set<string>(),
  };
  for (const edge of data?.taskTargets?.edges ?? []) {
    const n = edge?.node;
    if (!n) continue;
    if (typeof n.id === 'string') out.taskTargetIds.push(n.id);
    if (typeof n.targetPersonId === 'string' && n.targetPersonId.length > 0) {
      out.personIds.add(n.targetPersonId);
    }
    if (typeof n.targetCompanyId === 'string' && n.targetCompanyId.length > 0) {
      out.companyIds.add(n.targetCompanyId);
    }
    if (typeof n.targetOpportunityId === 'string' && n.targetOpportunityId.length > 0) {
      out.opportunityIds.add(n.targetOpportunityId);
    }
    if (typeof n.targetSalesNoteId === 'string' && n.targetSalesNoteId.length > 0) {
      out.salesNoteIds.add(n.targetSalesNoteId);
    }
  }
  return out;
};

const EXTRACTION_SYSTEM_PROMPT = [
  'You are a precise extractor. Given a sales-rep call/meeting note, identify any',
  'future actions the rep (or the contact) has committed to do, with a date when',
  'one is mentioned or can be inferred from relative phrases like "next Tuesday",',
  '"in 6 months", "before EOY".',
  '',
  'Return STRICT JSON of the form:',
  '{ "tasks": [ { "title": "...", "body": "...", "dueAt": "YYYY-MM-DDT00:00:00.000Z" | null, "rationale": "..." } ] }',
  '',
  'Rules:',
  '- title: a short imperative phrase, MAX 60 characters, no trailing period ("Send proposal to John", "Follow up on pricing"). Do not stuff context into the title.',
  '- body: 1-3 sentences with the actionable detail (who/what/why/specifics that wouldn\'t fit in the title). Empty string ("") if the title already says everything; do not pad.',
  '- dueAt: ISO 8601 timestamp. If the note has no time signal at all, use null.',
  '- rationale: short sentence pointing to the line in the note that triggered this.',
  '- Resolve relative dates against the "Note date" given in the user message.',
  '- If there are zero future actions, return {"tasks": []}.',
  '- Output ONLY the JSON. No markdown fences, no commentary.',
].join('\n');

const stripCodeFence = (raw: string): string => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return trimmed;
};

const callExtractAI = async (
  bodyMarkdown: string,
  noteDateIso: string,
): Promise<{ title: string; body: string; dueAt: string | null; rationale: string }[]> => {
  const { aiUrl, token } = getApiConfig();
  if (!token) throw new Error('AI endpoint token missing');
  const today = new Date().toISOString().split('T')[0];
  const userPrompt =
    `Today: ${today}\nNote date: ${noteDateIso}\n\nNote body:\n${bodyMarkdown}`;
  const response = await fetch(aiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      systemPrompt: EXTRACTION_SYSTEM_PROMPT,
      userPrompt,
    }),
  });
  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`AI request failed (${response.status}): ${errBody}`);
  }
  const data = (await response.json()) as { text?: string };
  if (!data.text) return [];
  let parsed: {
    tasks?: { title?: string; body?: string; dueAt?: string | null; rationale?: string }[];
  };
  try {
    parsed = JSON.parse(stripCodeFence(data.text));
  } catch {
    throw new Error(`AI returned non-JSON: ${data.text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed.tasks)) return [];
  const out: { title: string; body: string; dueAt: string | null; rationale: string }[] = [];
  for (const t of parsed.tasks) {
    const title = typeof t.title === 'string' ? t.title.trim() : '';
    if (title.length === 0) continue;
    out.push({
      title,
      body: typeof t.body === 'string' ? t.body.trim() : '',
      dueAt: typeof t.dueAt === 'string' && t.dueAt.length > 0 ? t.dueAt : null,
      rationale: typeof t.rationale === 'string' ? t.rationale : '',
    });
  }
  return out;
};

const createTask = async (
  title: string,
  body: string,
  dueAt: string | null,
  assigneeId: string | null,
  status: 'DRAFT' | 'TODO',
): Promise<string> => {
  const data: Record<string, unknown> = { title, status };
  if (dueAt !== null) data.dueAt = dueAt;
  if (assigneeId !== null) data.assigneeId = assigneeId;
  // Twenty's task.bodyV2 is RICH_TEXT_V2: { blocknote, markdown }. We supply
  // markdown only — the editor lazy-builds the blocknote shape on first open.
  // Same pattern as on-sales-note-created / voicenotes-webhook for body.
  if (body.length > 0) {
    data.bodyV2 = { blocknote: null, markdown: body };
  }
  const resp = (await graphqlFetch(
    `mutation CreateTaskFromSalesNote($data: TaskCreateInput!) {
       createTask(data: $data) { id }
     }`,
    { data },
  )) as { createTask?: { id?: string } };
  if (!resp.createTask?.id) throw new Error('createTask returned no id');
  return resp.createTask.id;
};

// On-blur incremental updates from the proposal panel inputs.
const updateTask = async (
  taskId: string,
  patch: {
    title?: string;
    bodyV2?: { blocknote: null; markdown: string };
    dueAt?: string | null;
    status?: 'DRAFT' | 'TODO';
  },
): Promise<void> => {
  await graphqlFetch(
    `mutation UpdateExtractedTask($id: UUID!, $data: TaskUpdateInput!) {
       updateTask(id: $id, data: $data) { id }
     }`,
    { id: taskId, data: patch },
  );
};

// Soft-delete (sets deletedAt). Verified against UAT 2026-05-05:
//   deleteTask(id) { id deletedAt } returns the row with deletedAt populated.
// destroyTask is the hard-delete variant we don't want here.
const deleteTask = async (taskId: string): Promise<void> => {
  await graphqlFetch(
    `mutation DeleteExtractedTask($id: UUID!) {
       deleteTask(id: $id) { id deletedAt }
     }`,
    { id: taskId },
  );
};

const createTaskTarget = async (
  taskId: string,
  fields: {
    targetPersonId?: string;
    targetCompanyId?: string;
    targetOpportunityId?: string;
    targetSalesNoteId?: string;
  },
): Promise<void> => {
  await graphqlFetch(
    `mutation CreateTaskTargetFromSalesNote($data: TaskTargetCreateInput!) {
       createTaskTarget(data: $data) { id }
     }`,
    { data: { taskId, ...fields } },
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

const buttonStyle = {
  background: '#1a73e8',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '13px',
  cursor: 'pointer',
};
const ghostButton = {
  background: 'transparent',
  color: '#1a73e8',
  border: '1px solid #1a73e8',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '12px',
  cursor: 'pointer',
};
const dangerButton = {
  background: 'transparent',
  color: '#c0392b',
  border: '1px solid #c0392b',
  borderRadius: '4px',
  padding: '4px 10px',
  fontSize: '12px',
  cursor: 'pointer',
};
const card = {
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '10px',
  padding: '14px 16px',
  marginBottom: '10px',
};
const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid #d0d7de',
  borderRadius: '4px',
  fontSize: '13px',
  marginTop: '4px',
  boxSizing: 'border-box' as const,
};
const labelStyle = {
  fontSize: '11px',
  color: '#57606a',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  display: 'block',
  marginTop: '8px',
};
const messageStyle = {
  padding: '10px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  marginBottom: '12px',
};

// Reads <input> values across the remote-DOM sandbox: change events expose
// the value at event.detail.value (lesson #13 in the master plan).
const readEventValue = (e: unknown): string | null => {
  const detail = (e as { detail?: { value?: unknown } }).detail;
  if (typeof detail?.value === 'string') return detail.value;
  const target = (e as { target?: { value?: unknown } }).target;
  if (typeof target?.value === 'string') return target.value;
  return null;
};

// ─── ProposalCard ────────────────────────────────────────────────────────────
// Sub-component with LOCAL state for each input, isolated from siblings via
// React.memo. This prevents the cursor-jump bug: when a parent re-renders due
// to ANY state change (sibling card edits, async fetches, etc.), the value
// prop on this card's input is recomputed from PARENT state, the worker
// pushes "set value" to the host, and the host resets cursor to end. Mirroring
// inputs to LOCAL state means the value prop only changes when YOU type in
// THIS input — perfectly synchronous with keystrokes — and React's diff sees
// no value change to propagate, so the cursor stays where it is.
//
// Pattern lifted from `apps/stratum-quote-app/src/components/quote-sections-panel.tsx`
// `LineItemRow`, which solved the same problem in the same sandbox.
//
// Parent state is updated on blur AND each on-blur fires an updateTask
// mutation against the DRAFT row in DB. Re-extraction remounts cards via a
// `key` change at the call site so local state resets to the new
// defaultValues.

type ProposalCardProps = {
  taskId: string;
  initialTitle: string;
  initialBody: string;
  initialDueAt: string | null;
  rationale: string;
  onCommitTitle: (taskId: string, value: string) => void;
  onCommitBody: (taskId: string, value: string) => void;
  onCommitDueAt: (taskId: string, value: string | null) => void;
  onRemove: (taskId: string) => void;
  syncError: string | null;
};

const ProposalCardImpl = ({
  taskId,
  initialTitle,
  initialBody,
  initialDueAt,
  rationale,
  onCommitTitle,
  onCommitBody,
  onCommitDueAt,
  onRemove,
  syncError,
}: ProposalCardProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [dueAtStr, setDueAtStr] = useState(initialDueAt ?? '');

  // Workaround for sandbox cursor-jump:
  //   Editing in the middle of pre-populated text causes the cursor to jump
  //   to the end on every keystroke. The remote-DOM <input> wrapper is fully
  //   controlled (rejects keystrokes that don't update value=) AND its host
  //   re-applies the value prop without preserving cursor position. There's
  //   no React-side workaround since refs don't expose .setSelectionRange.
  //   Workaround for users: Cmd+A to select-all, then retype.

  return (
    <div style={card}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <span style={labelStyle}>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const v = readEventValue(e);
              if (v !== null) setTitle(v);
            }}
            onBlur={() => onCommitTitle(taskId, title)}
            style={inputStyle}
          />
          <span style={labelStyle}>Notes</span>
          <textarea
            value={body}
            placeholder="(optional — extra detail beyond the title)"
            rows={3}
            onChange={(e) => {
              const v = readEventValue(e);
              if (v !== null) setBody(v);
            }}
            onBlur={() => onCommitBody(taskId, body)}
            style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit' }}
          />
          <span style={labelStyle}>Due date (ISO; clear for "no date")</span>
          <input
            type="text"
            value={dueAtStr}
            placeholder="2026-05-01T00:00:00.000Z"
            onChange={(e) => {
              const v = readEventValue(e);
              if (v !== null) setDueAtStr(v);
            }}
            onBlur={() =>
              onCommitDueAt(
                taskId,
                dueAtStr.trim().length > 0 ? dueAtStr.trim() : null,
              )
            }
            style={inputStyle}
          />
          {rationale && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '11.5px',
                color: '#57606a',
                fontStyle: 'italic',
              }}
            >
              Rationale: {rationale}
            </div>
          )}
          {syncError && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '11.5px',
                color: '#c0392b',
              }}
            >
              Sync error: {syncError}
            </div>
          )}
        </div>
        <button onClick={() => onRemove(taskId)} style={dangerButton}>
          Remove
        </button>
      </div>
    </div>
  );
};

const ProposalCard = memo(ProposalCardImpl);

const ExtractTasksPanel = () => {
  const recordId = useRecordId();
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [finalising, setFinalising] = useState(false);
  const [proposals, setProposals] = useState<ProposedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SalesNoteSnapshot | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  // Bumps on each successful extraction OR on-mount fetch so cards remount
  // with fresh local state seeded from the new proposals. Within an editing
  // session the key stays stable so each card keeps its identity (and
  // React.memo prevents re-renders when siblings change).
  const [extractionId, setExtractionId] = useState(0);

  // ── On mount: query existing DRAFT tasks for this salesNote ───────────────
  useEffect(() => {
    if (typeof recordId !== 'string' || recordId.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchExistingDraftsForSalesNote(recordId)
      .then((drafts) => {
        setProposals(drafts);
        setExtractionId((n) => n + 1);
      })
      .catch((e) => {
        console.error('[extract-tasks] failed to load existing drafts', e);
        setError(
          `Failed to load existing drafts: ${e instanceof Error ? e.message : String(e)}`,
        );
      })
      .finally(() => setLoading(false));
  }, [recordId]);

  const setCardError = useCallback((taskId: string, msg: string | null) => {
    setCardErrors((prev) => {
      const next = { ...prev };
      if (msg === null) delete next[taskId];
      else next[taskId] = msg;
      return next;
    });
  }, []);

  // ── On-blur sync handlers (per ProposalCard input) ────────────────────────
  const handleCommitTitle = useCallback(
    (taskId: string, value: string) => {
      setProposals((prev) =>
        prev.map((p) => (p.taskId === taskId ? { ...p, title: value } : p)),
      );
      updateTask(taskId, { title: value })
        .then(() => setCardError(taskId, null))
        .catch((e) => {
          console.error('[extract-tasks] updateTask(title) failed', e);
          setCardError(
            taskId,
            `title save failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        });
    },
    [setCardError],
  );

  const handleCommitBody = useCallback(
    (taskId: string, value: string) => {
      setProposals((prev) =>
        prev.map((p) => (p.taskId === taskId ? { ...p, body: value } : p)),
      );
      // Twenty's bodyV2 is RICH_TEXT_V2 { blocknote, markdown }; sending
      // markdown only is fine — the editor lazy-builds the blocknote shape
      // on first open. Same pattern as createTask above.
      updateTask(taskId, { bodyV2: { blocknote: null, markdown: value } })
        .then(() => setCardError(taskId, null))
        .catch((e) => {
          console.error('[extract-tasks] updateTask(body) failed', e);
          setCardError(
            taskId,
            `body save failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        });
    },
    [setCardError],
  );

  const handleCommitDueAt = useCallback(
    (taskId: string, value: string | null) => {
      setProposals((prev) =>
        prev.map((p) => (p.taskId === taskId ? { ...p, dueAt: value } : p)),
      );
      updateTask(taskId, { dueAt: value })
        .then(() => setCardError(taskId, null))
        .catch((e) => {
          console.error('[extract-tasks] updateTask(dueAt) failed', e);
          setCardError(
            taskId,
            `due-date save failed: ${e instanceof Error ? e.message : String(e)}`,
          );
        });
    },
    [setCardError],
  );

  const handleRemove = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId);
        setProposals((prev) => prev.filter((p) => p.taskId !== taskId));
        setCardError(taskId, null);
      } catch (e) {
        console.error('[extract-tasks] deleteTask failed', e);
        setCardError(
          taskId,
          `remove failed: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    },
    [setCardError],
  );

  const handleDiscardAll = useCallback(async () => {
    if (proposals.length === 0) return;
    setError(null);
    setSuccess(null);
    const ids = proposals.map((p) => p.taskId);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => deleteTask(id)),
      );
      const failed = results.filter((r) => r.status === 'rejected');
      // Drop the successfully-deleted ones from local state regardless;
      // re-mount would pick up only DRAFTs anyway.
      const survivors: ProposedTask[] = [];
      results.forEach((r, idx) => {
        if (r.status === 'rejected') survivors.push(proposals[idx]);
      });
      setProposals(survivors);
      if (failed.length > 0) {
        const firstReason = (failed[0] as PromiseRejectedResult).reason;
        const msg = firstReason instanceof Error ? firstReason.message : String(firstReason);
        setError(
          `Discarded ${ids.length - failed.length} of ${ids.length}; ${failed.length} failed (${msg}).`,
        );
      } else {
        setSuccess(`Discarded ${ids.length} draft${ids.length === 1 ? '' : 's'}.`);
      }
    } catch (e) {
      console.error('[extract-tasks] discardAll failed', e);
      setError(`Discard failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [proposals]);

  // ── Extract: AI run → create DRAFT tasks immediately ──────────────────────
  const handleExtract = useCallback(async () => {
    if (recordId == null) return;
    if (proposals.length > 0) return; // belt + braces; button is disabled too
    const id = recordId;
    setError(null);
    setSuccess(null);
    setExtracting(true);
    try {
      const snap = await fetchSalesNoteSnapshot(id);
      setSnapshot(snap);
      if (snap.bodyMarkdown.trim().length === 0) {
        setError('Note body is empty — type some notes in the body field first.');
        return;
      }
      const noteDateIso = snap.createdAt ?? new Date().toISOString();
      const extracted = await callExtractAI(snap.bodyMarkdown, noteDateIso);
      if (extracted.length === 0) {
        setSuccess('No future actions found in this note.');
        return;
      }
      // Create each proposal as a DRAFT task immediately, with current-snapshot
      // relations attached. Failure on any one aborts the loop but keeps
      // any drafts we already persisted (they'll be visible on next mount).
      const seeded: ProposedTask[] = [];
      for (const e of extracted) {
        const taskId = await createTask(e.title, e.body, e.dueAt, snap.ownerId, 'DRAFT');
        // Always link back to this sales note so it shows in the Linked
        // Tasks tab and the next-mount query finds it.
        await createTaskTarget(taskId, { targetSalesNoteId: id });
        for (const personId of snap.attendeePersonIds) {
          await createTaskTarget(taskId, { targetPersonId: personId });
        }
        if (snap.companyId) {
          await createTaskTarget(taskId, { targetCompanyId: snap.companyId });
        }
        if (snap.opportunityId) {
          await createTaskTarget(taskId, { targetOpportunityId: snap.opportunityId });
        }
        seeded.push({
          taskId,
          title: e.title,
          body: e.body,
          dueAt: e.dueAt,
          rationale: e.rationale,
        });
      }
      setProposals(seeded);
      setExtractionId((n) => n + 1);
      const word = seeded.length === 1 ? 'draft' : 'drafts';
      setSuccess(
        `Created ${seeded.length} ${word}. Edit, remove, or click Finalise to promote to TODO.`,
      );
    } catch (e) {
      console.error('[extract-tasks] extract failed', e);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExtracting(false);
    }
  }, [recordId, proposals.length]);

  // ── Finalise: refresh relations + flip DRAFT → TODO ───────────────────────
  const handleFinalise = useCallback(async () => {
    if (proposals.length === 0) return;
    if (recordId == null) return;
    const salesNoteId = recordId;
    setError(null);
    setSuccess(null);
    setFinalising(true);
    let finalisedCount = 0;
    try {
      const liveSnap = await fetchSalesNoteSnapshot(salesNoteId);
      for (const p of proposals) {
        const existing = await fetchTaskTargets(p.taskId);
        // Add any relations from liveSnap not already attached. We only
        // ADD here — we never remove — so removals on the salesNote since
        // extract-time stay safe (the user can still remove manually from
        // the task UI).
        if (!existing.salesNoteIds.has(salesNoteId)) {
          await createTaskTarget(p.taskId, { targetSalesNoteId: salesNoteId });
        }
        if (
          liveSnap.companyId &&
          !existing.companyIds.has(liveSnap.companyId)
        ) {
          await createTaskTarget(p.taskId, { targetCompanyId: liveSnap.companyId });
        }
        if (
          liveSnap.opportunityId &&
          !existing.opportunityIds.has(liveSnap.opportunityId)
        ) {
          await createTaskTarget(p.taskId, { targetOpportunityId: liveSnap.opportunityId });
        }
        for (const personId of liveSnap.attendeePersonIds) {
          if (!existing.personIds.has(personId)) {
            await createTaskTarget(p.taskId, { targetPersonId: personId });
          }
        }
        await updateTask(p.taskId, { status: 'TODO' });
        finalisedCount += 1;
      }
      setProposals([]);
      setSnapshot(liveSnap);
      const word = finalisedCount === 1 ? 'task' : 'tasks';
      setSuccess(
        `Finalised ${finalisedCount} ${word} — status TODO. New relations linked from current call report state.`,
      );
    } catch (e) {
      console.error('[extract-tasks] finalise failed', e);
      const msg = e instanceof Error ? e.message : String(e);
      setError(`${msg} (finalised ${finalisedCount} of ${proposals.length} before failing)`);
    } finally {
      setFinalising(false);
    }
  }, [proposals, recordId]);

  const buttonLabel = extracting ? 'Extracting…' : 'Extract tasks from notes';
  const isReadyToExtract =
    !loading &&
    !extracting &&
    !finalising &&
    recordId != null &&
    proposals.length === 0;
  const proposalCountWord = proposals.length === 1 ? 'task' : 'tasks';

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ marginBottom: '14px' }}>
        <button
          onClick={handleExtract}
          disabled={!isReadyToExtract}
          style={{ ...buttonStyle, opacity: isReadyToExtract ? 1 : 0.6 }}
        >
          {buttonLabel}
        </button>
        {snapshot && (
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#57606a' }}>
            Will link to {snapshot.attendeePersonIds.length} attendee
            {snapshot.attendeePersonIds.length === 1 ? '' : 's'}
            {snapshot.companyId ? ' + account' : ''}
            {snapshot.opportunityId ? ' + opportunity' : ''}
          </span>
        )}
        {!loading && !extracting && proposals.length > 0 && (
          <span style={{ marginLeft: '12px', fontSize: '12px', color: '#57606a' }}>
            (Finalise or discard existing drafts before extracting more.)
          </span>
        )}
      </div>

      {error && (
        <div style={{ ...messageStyle, background: '#fde8e8', color: '#c0392b' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ ...messageStyle, background: '#e6f7ec', color: '#1e7e34' }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: '12px', color: '#57606a' }}>Loading existing drafts…</div>
      ) : proposals.length === 0 ? (
        <div style={{ fontSize: '12px', color: '#57606a', fontStyle: 'italic' }}>
          No drafts yet — click Extract to generate.
        </div>
      ) : (
        <div>
          <div
            style={{
              fontSize: '12px',
              color: '#57606a',
              marginBottom: '8px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Draft tasks ({proposals.length}) — edits sync as you blur each field
          </div>
          {proposals.map((p) => (
            <ProposalCard
              key={`${extractionId}-${p.taskId}`}
              taskId={p.taskId}
              initialTitle={p.title}
              initialBody={p.body}
              initialDueAt={p.dueAt}
              rationale={p.rationale}
              onCommitTitle={handleCommitTitle}
              onCommitBody={handleCommitBody}
              onCommitDueAt={handleCommitDueAt}
              onRemove={handleRemove}
              syncError={cardErrors[p.taskId] ?? null}
            />
          ))}

          <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleFinalise}
              disabled={finalising}
              style={{ ...buttonStyle, opacity: finalising ? 0.6 : 1 }}
            >
              {finalising
                ? 'Finalising…'
                : `Finalise ${proposals.length} ${proposalCountWord}`}
            </button>
            <button
              onClick={handleDiscardAll}
              disabled={finalising}
              style={ghostButton}
            >
              Discard all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: EXTRACT_TASKS_PANEL_UID,
  name: 'extract-tasks-panel',
  description:
    'Calls the AI to extract follow-up tasks (with due dates) from the call report body, creates them as DRAFT Twenty Tasks immediately, and lets the user edit/remove/finalise them. Finalise promotes DRAFT → TODO and refreshes relations to current sales-note state.',
  component: ExtractTasksPanel,
});
