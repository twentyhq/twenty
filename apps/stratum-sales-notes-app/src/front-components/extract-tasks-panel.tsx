import { useCallback, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useRecordId } from 'twenty-sdk/front-component';

import { EXTRACT_TASKS_PANEL_UID } from 'src/constants/universal-identifiers';

// ─── Types ───────────────────────────────────────────────────────────────────

type ProposedTask = {
  title: string;
  dueAt: string | null;
  rationale: string;
  targetPersonIds: string[];
  targetCompanyId: string | null;
  targetOpportunityId: string | null;
};

type SalesNoteSnapshot = {
  bodyMarkdown: string;
  createdAt: string | null;
  attendeePersonIds: string[];
  companyId: string | null;
  opportunityId: string | null;
  ownerId: string | null;
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
  if (!sn) throw new Error('Sales note not found');
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

const EXTRACTION_SYSTEM_PROMPT = [
  'You are a precise extractor. Given a sales-rep call/meeting note, identify any',
  'future actions the rep (or the contact) has committed to do, with a date when',
  'one is mentioned or can be inferred from relative phrases like "next Tuesday",',
  '"in 6 months", "before EOY".',
  '',
  'Return STRICT JSON of the form:',
  '{ "tasks": [ { "title": "...", "dueAt": "YYYY-MM-DDT00:00:00.000Z" | null, "rationale": "..." } ] }',
  '',
  'Rules:',
  '- title: a short imperative phrase ("Send proposal to John", "Follow up on pricing")',
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
): Promise<{ title: string; dueAt: string | null; rationale: string }[]> => {
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
  let parsed: { tasks?: { title?: string; dueAt?: string | null; rationale?: string }[] };
  try {
    parsed = JSON.parse(stripCodeFence(data.text));
  } catch {
    throw new Error(`AI returned non-JSON: ${data.text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed.tasks)) return [];
  const out: { title: string; dueAt: string | null; rationale: string }[] = [];
  for (const t of parsed.tasks) {
    const title = typeof t.title === 'string' ? t.title.trim() : '';
    if (title.length === 0) continue;
    out.push({
      title,
      dueAt: typeof t.dueAt === 'string' && t.dueAt.length > 0 ? t.dueAt : null,
      rationale: typeof t.rationale === 'string' ? t.rationale : '',
    });
  }
  return out;
};

const createTask = async (
  title: string,
  dueAt: string | null,
  assigneeId: string | null,
): Promise<string> => {
  const data: Record<string, unknown> = { title };
  if (dueAt !== null) data.dueAt = dueAt;
  if (assigneeId !== null) data.assigneeId = assigneeId;
  const resp = (await graphqlFetch(
    `mutation CreateTaskFromSalesNote($data: TaskCreateInput!) {
       createTask(data: $data) { id }
     }`,
    { data },
  )) as { createTask?: { id?: string } };
  if (!resp.createTask?.id) throw new Error('createTask returned no id');
  return resp.createTask.id;
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

const ExtractTasksPanel = () => {
  const recordId = useRecordId();
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [proposals, setProposals] = useState<ProposedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SalesNoteSnapshot | null>(null);

  const handleExtract = useCallback(async () => {
    if (recordId == null) return;
    const id = recordId;
    setError(null);
    setSuccess(null);
    setExtracting(true);
    try {
      const snap = await fetchSalesNoteSnapshot(id);
      setSnapshot(snap);
      if (snap.bodyMarkdown.trim().length === 0) {
        setError('Note body is empty — type some notes in the body field first.');
        setProposals([]);
        return;
      }
      const noteDateIso = snap.createdAt ?? new Date().toISOString();
      const extracted = await callExtractAI(snap.bodyMarkdown, noteDateIso);
      const seeded: ProposedTask[] = extracted.map((e) => ({
        title: e.title,
        dueAt: e.dueAt,
        rationale: e.rationale,
        targetPersonIds: snap.attendeePersonIds,
        targetCompanyId: snap.companyId,
        targetOpportunityId: snap.opportunityId,
      }));
      setProposals(seeded);
      if (seeded.length === 0) setSuccess('No future actions found in this note.');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExtracting(false);
    }
  }, [recordId]);

  const updateProposal = (idx: number, patch: Partial<ProposedTask>) =>
    setProposals((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  const removeProposal = (idx: number) =>
    setProposals((prev) => prev.filter((_, i) => i !== idx));

  const handleCreate = useCallback(async () => {
    if (proposals.length === 0) return;
    if (recordId == null) return;
    const salesNoteId = recordId;
    const assigneeId = snapshot?.ownerId ?? null;
    setError(null);
    setSuccess(null);
    setCreating(true);
    let createdCount = 0;
    try {
      for (const p of proposals) {
        const taskId = await createTask(p.title, p.dueAt, assigneeId);
        // Always link the task back to this sales note so it appears in
        // the Linked Tasks tab.
        await createTaskTarget(taskId, { targetSalesNoteId: salesNoteId });
        for (const personId of p.targetPersonIds) {
          await createTaskTarget(taskId, { targetPersonId: personId });
        }
        if (p.targetCompanyId) {
          await createTaskTarget(taskId, { targetCompanyId: p.targetCompanyId });
        }
        if (p.targetOpportunityId) {
          await createTaskTarget(taskId, { targetOpportunityId: p.targetOpportunityId });
        }
        createdCount += 1;
      }
      setProposals([]);
      const word = createdCount === 1 ? 'task' : 'tasks';
      const assignedNote = assigneeId
        ? ' Assigned to the sales note owner.'
        : ' (Sales note has no owner — tasks created unassigned. Set the Owner field to auto-assign next time.)';
      setSuccess(
        `Created ${createdCount} ${word} linked to this sales note.${assignedNote}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`${msg} (created ${createdCount} of ${proposals.length} before failing)`);
    } finally {
      setCreating(false);
    }
  }, [proposals, recordId, snapshot]);

  const buttonLabel = extracting ? 'Extracting…' : 'Extract tasks from notes';
  const isReadyToExtract = !extracting && !creating && recordId != null;
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

      {proposals.length > 0 && (
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
            Proposed tasks ({proposals.length}) — review, edit or remove before creating
          </div>
          {proposals.map((p, idx) => (
            <div key={idx} style={card}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <span style={labelStyle}>Title</span>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => {
                      const v = (e as unknown as { detail?: { value?: string } }).detail?.value;
                      if (typeof v === 'string') updateProposal(idx, { title: v });
                    }}
                    style={inputStyle}
                  />
                  <span style={labelStyle}>Due date (ISO; clear for "no date")</span>
                  <input
                    type="text"
                    value={p.dueAt ?? ''}
                    placeholder="2026-05-01T00:00:00.000Z"
                    onChange={(e) => {
                      const v = (e as unknown as { detail?: { value?: string } }).detail?.value;
                      if (typeof v === 'string') {
                        updateProposal(idx, { dueAt: v.trim().length === 0 ? null : v.trim() });
                      }
                    }}
                    style={inputStyle}
                  />
                  {p.rationale && (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '11.5px',
                        color: '#57606a',
                        fontStyle: 'italic',
                      }}
                    >
                      Rationale: {p.rationale}
                    </div>
                  )}
                </div>
                <button onClick={() => removeProposal(idx)} style={dangerButton}>
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{ ...buttonStyle, opacity: creating ? 0.6 : 1 }}
            >
              {creating ? 'Creating…' : `Create ${proposals.length} ${proposalCountWord}`}
            </button>
            <button
              onClick={() => setProposals([])}
              disabled={creating}
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
    'Calls the AI to extract follow-up tasks (with due dates) from the sales note body, lets the user review/edit them, and creates them as Twenty Tasks linked to the same attendees / company / opportunity.',
  component: ExtractTasksPanel,
});
