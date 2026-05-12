import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
} from 'twenty-sdk/front-component';

import { CREATE_ISSUE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type LinearTeam = {
  id: string;
  name: string;
  key: string;
};

type LinearWorkflowState = {
  id: string;
  name: string;
  type: string;
  position: number;
};

type LinearMember = {
  id: string;
  name: string;
  displayName: string;
};

type LinearProject = {
  id: string;
  name: string;
};

type LinearLabel = {
  id: string;
  name: string;
  color: string;
};

type LinearCycle = {
  id: string;
  name: string | null;
  number: number;
  startsAt: string;
  endsAt: string;
};

type IssueOptions = {
  states: LinearWorkflowState[];
  members: LinearMember[];
  projects: LinearProject[];
  labels: LinearLabel[];
  cycles: LinearCycle[];
  estimationType: string;
  estimationAllowZero: boolean;
};

type CreatedIssue = {
  id: string;
  identifier: string;
  title: string;
  url: string;
};

const PRIORITY_OPTIONS = [
  { value: 0, label: 'No priority' },
  { value: 1, label: 'Urgent' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Low' },
];

const ESTIMATE_SCALES: Record<string, { value: number; label: string }[]> = {
  exponential: [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 8, label: '8' },
    { value: 16, label: '16' },
    { value: 32, label: '32' },
  ],
  fibonacci: [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
    { value: 8, label: '8' },
    { value: 13, label: '13' },
    { value: 21, label: '21' },
  ],
  linear: [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
  ],
  tShirt: [
    { value: 1, label: 'XS' },
    { value: 2, label: 'S' },
    { value: 3, label: 'M' },
    { value: 5, label: 'L' },
    { value: 8, label: 'XL' },
    { value: 13, label: 'XXL' },
  ],
};

// The front component sandbox dispatches events with a non-standard shape.
// Values may live on e.detail.value, e.value, or e.target.value.
const readSerializedValue = (
  e: React.SyntheticEvent<HTMLElement>,
): string | undefined => {
  const obj = e as {
    detail?: { value?: string };
    value?: string;
    target?: { value?: string };
  };

  if (typeof obj.detail?.value === 'string') return obj.detail.value;
  if (typeof obj.value === 'string') return obj.value;
  if (typeof obj.target?.value === 'string') return obj.target.value;

  return undefined;
};

const onValueChange =
  (fn: (value: string) => void) =>
  (e: React.SyntheticEvent<HTMLElement>) => {
    const v = readSerializedValue(e);

    if (typeof v === 'string') fn(v);
  };

const callAppRoute = async (
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
) => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  const response = await fetch(`${apiBaseUrl}/s${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    throw new Error(
      `Request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return response.json();
};

const STYLES = {
  container: {
    padding: '20px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '13px',
    color: '#333',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  header: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#141414',
    margin: 0,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  fieldRow: {
    display: 'flex',
    gap: '12px',
  },
  fieldRowItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#666',
  },
  input: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
    fontFamily: 'Inter, system-ui, sans-serif',
    outline: 'none',
    transition: 'border-color 0.15s',
    backgroundColor: '#fff',
  },
  select: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
    fontFamily: 'Inter, system-ui, sans-serif',
    outline: 'none',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  textarea: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '13px',
    fontFamily: 'Inter, system-ui, sans-serif',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    backgroundColor: '#fff',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'background-color 0.15s',
  },
  primaryButton: {
    backgroundColor: '#141414',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#999',
    color: '#fff',
    cursor: 'not-allowed',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    padding: '24px',
    textAlign: 'center' as const,
  },
  issueLink: {
    color: '#141414',
    fontWeight: 500,
    textDecoration: 'none',
    fontSize: '14px',
  },
  errorText: {
    color: '#e05252',
    fontSize: '12px',
  },
  loadingText: {
    color: '#999',
    fontSize: '13px',
    textAlign: 'center' as const,
    padding: '24px',
  },
  labelsContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
  },
  labelChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#fff',
  },
  labelChipSelected: {
    borderColor: '#141414',
    backgroundColor: '#f5f5f5',
  },
  labelDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};

const EMPTY_OPTIONS: IssueOptions = {
  states: [],
  members: [],
  projects: [],
  labels: [],
  cycles: [],
  estimationType: 'notUsed',
  estimationAllowZero: false,
};

const CreateIssueForm = () => {
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdIssue, setCreatedIssue] = useState<CreatedIssue | null>(null);
  const [closing, setClosing] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [options, setOptions] = useState<IssueOptions>(EMPTY_OPTIONS);

  const [teamId, setTeamId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('0');
  const [stateId, setStateId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [estimate, setEstimate] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [cycleId, setCycleId] = useState('');
  const [dueDate, setDueDate] = useState('');

  const fetchIssueOptions = useCallback(async (selectedTeamId: string) => {
    if (!selectedTeamId) {
      setOptions(EMPTY_OPTIONS);
      setStateId('');
      setAssigneeId('');
      setProjectId('');
      setEstimate('');
      setSelectedLabelIds([]);
      setCycleId('');

      return;
    }

    setOptionsLoading(true);

    try {
      const result = await callAppRoute(
        `/linear/issue-options?teamId=${encodeURIComponent(selectedTeamId)}`,
        'GET',
      );

      if (!result.success) {
        setOptions(EMPTY_OPTIONS);

        return;
      }

      const issueOptions: IssueOptions = result.options;

      setOptions(issueOptions);

      const todoState = issueOptions.states.find(
        (s) => s.type === 'unstarted',
      );

      setStateId(todoState?.id ?? issueOptions.states[0]?.id ?? '');
      setAssigneeId('');
      setProjectId('');
      setEstimate('');
      setSelectedLabelIds([]);
      setCycleId('');
    } catch {
      setOptions(EMPTY_OPTIONS);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  const handleTeamChange = useCallback(
    (newTeamId: string) => {
      setTeamId(newTeamId);
      fetchIssueOptions(newTeamId);
    },
    [fetchIssueOptions],
  );

  const fetchTeams = useCallback(async () => {
    try {
      setTeamsError(null);
      const result = await callAppRoute('/linear/teams', 'GET');

      if (!result.success) {
        setTeamsError(result.error ?? 'Failed to load teams');

        return;
      }

      setTeams(result.teams ?? []);

      if (result.teams?.length === 1) {
        setTeamId(result.teams[0].id);
        fetchIssueOptions(result.teams[0].id);
      }
    } catch (error) {
      setTeamsError(
        error instanceof Error ? error.message : 'Failed to load teams',
      );
    } finally {
      setTeamsLoading(false);
    }
  }, [fetchIssueOptions]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const toggleLabel = useCallback((labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );
  }, []);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();

    if (!teamId || !trimmedTitle) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await callAppRoute('/linear/issues', 'POST', {
        teamId,
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority: Number(priority) || undefined,
        stateId: stateId || undefined,
        assigneeId: assigneeId || undefined,
        projectId: projectId || undefined,
        estimate: estimate ? Number(estimate) : undefined,
        labelIds: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
        cycleId: cycleId || undefined,
        dueDate: dueDate || undefined,
      });

      if (!result.success) {
        await enqueueSnackbar({
          message: result.error ?? 'Failed to create issue',
          variant: 'error',
        });
        setSubmitting(false);

        return;
      }

      setCreatedIssue(result.issue);
      await enqueueSnackbar({
        message: `Created ${result.issue.identifier}: ${result.issue.title}`,
        variant: 'success',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Failed to create issue',
        variant: 'error',
      });
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setClosing(true);
    unmountFrontComponent();
    closeSidePanel();
  };

  if (closing) {
    return null;
  }

  if (createdIssue) {
    return (
      <div style={STYLES.successContainer}>
        <span style={{ fontSize: '24px' }}>✓</span>
        <a
          href={createdIssue.url}
          target="_blank"
          rel="noopener noreferrer"
          style={STYLES.issueLink}
        >
          {createdIssue.identifier}: {createdIssue.title}
        </a>
        <button
          type="button"
          style={{ ...STYLES.button, ...STYLES.cancelButton }}
          onClick={handleCancel}
        >
          Close
        </button>
      </div>
    );
  }

  if (teamsLoading) {
    return <div style={STYLES.loadingText}>Loading teams...</div>;
  }

  if (teamsError) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={STYLES.errorText}>{teamsError}</p>
        <button
          type="button"
          style={{
            ...STYLES.button,
            ...STYLES.cancelButton,
            marginTop: '8px',
          }}
          onClick={fetchTeams}
        >
          Retry
        </button>
      </div>
    );
  }

  const canSubmit = teamId && title.trim() && !submitting;
  const hasEstimates = options.estimationType !== 'notUsed';
  const baseEstimateOptions = ESTIMATE_SCALES[options.estimationType] ?? [];
  const estimateOptions =
    options.estimationAllowZero &&
    baseEstimateOptions.length > 0 &&
    !baseEstimateOptions.some((o) => o.value === 0)
      ? [{ value: 0, label: 'None' }, ...baseEstimateOptions]
      : baseEstimateOptions;

  return (
    <div style={STYLES.container}>
      <h3 style={STYLES.header}>Create Linear Issue</h3>

      <div style={STYLES.fieldGroup}>
        <label style={STYLES.label}>Team</label>
        <select
          value={teamId}
          onChange={onValueChange(handleTeamChange)}
          style={STYLES.select}
        >
          <option value="">Select a team...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.key})
            </option>
          ))}
        </select>
      </div>

      <div style={STYLES.fieldGroup}>
        <label style={STYLES.label}>Title</label>
        <input
          value={title}
          onInput={onValueChange(setTitle)}
          onChange={onValueChange(setTitle)}
          style={STYLES.input}
          type="text"
          placeholder="Issue title"
        />
      </div>

      <div style={STYLES.fieldGroup}>
        <label style={STYLES.label}>Description</label>
        <textarea
          value={description}
          onInput={onValueChange(setDescription)}
          onChange={onValueChange(setDescription)}
          style={STYLES.textarea}
          placeholder="Optional description (Markdown supported)"
        />
      </div>

      <div style={STYLES.fieldRow}>
        <div style={STYLES.fieldRowItem}>
          <label style={STYLES.label}>Status</label>
          <select
            value={stateId}
            onChange={onValueChange(setStateId)}
            style={STYLES.select}
            disabled={!teamId || optionsLoading}
          >
            {optionsLoading ? (
              <option value="">Loading...</option>
            ) : options.states.length === 0 ? (
              <option value="">Select a team first</option>
            ) : (
              options.states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))
            )}
          </select>
        </div>
        <div style={STYLES.fieldRowItem}>
          <label style={STYLES.label}>Priority</label>
          <select
            value={priority}
            onChange={onValueChange(setPriority)}
            style={STYLES.select}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={STYLES.fieldRow}>
        <div style={STYLES.fieldRowItem}>
          <label style={STYLES.label}>Assignee</label>
          <select
            value={assigneeId}
            onChange={onValueChange(setAssigneeId)}
            style={STYLES.select}
            disabled={!teamId || optionsLoading}
          >
            <option value="">Unassigned</option>
            {options.members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>
        </div>
        <div style={STYLES.fieldRowItem}>
          <label style={STYLES.label}>Project</label>
          <select
            value={projectId}
            onChange={onValueChange(setProjectId)}
            style={STYLES.select}
            disabled={!teamId || optionsLoading}
          >
            <option value="">No project</option>
            {options.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={STYLES.fieldRow}>
        <div style={STYLES.fieldRowItem}>
          <label style={STYLES.label}>Cycle</label>
          <select
            value={cycleId}
            onChange={onValueChange(setCycleId)}
            style={STYLES.select}
            disabled={!teamId || optionsLoading}
          >
            <option value="">No cycle</option>
            {options.cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name ?? `Cycle ${cycle.number}`}
              </option>
            ))}
          </select>
        </div>
        {hasEstimates && (
          <div style={STYLES.fieldRowItem}>
            <label style={STYLES.label}>Estimate</label>
            <select
              value={estimate}
              onChange={onValueChange(setEstimate)}
              style={STYLES.select}
              disabled={!teamId || optionsLoading}
            >
              <option value="">No estimate</option>
              {estimateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {options.labels.length > 0 && (
        <div style={STYLES.fieldGroup}>
          <label style={STYLES.label}>Labels</label>
          <div style={STYLES.labelsContainer}>
            {options.labels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id);

              return (
                <button
                  key={label.id}
                  type="button"
                  style={{
                    ...STYLES.labelChip,
                    ...(isSelected ? STYLES.labelChipSelected : {}),
                  }}
                  onClick={() => toggleLabel(label.id)}
                >
                  <span
                    style={{
                      ...STYLES.labelDot,
                      backgroundColor: label.color,
                    }}
                  />
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={STYLES.fieldGroup}>
        <label style={STYLES.label}>Due date</label>
        <input
          value={dueDate}
          onChange={onValueChange(setDueDate)}
          style={STYLES.input}
          type="date"
        />
      </div>

      <div style={STYLES.buttonRow}>
        <button
          type="button"
          style={{ ...STYLES.button, ...STYLES.cancelButton }}
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          style={{
            ...STYLES.button,
            ...(canSubmit ? STYLES.primaryButton : STYLES.disabledButton),
          }}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitting ? 'Creating...' : 'Create Issue'}
        </button>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: CREATE_ISSUE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'create-linear-issue-form',
  description:
    'Form to create a Linear issue with team, title, description, status, priority, assignee, project, cycle, estimate, labels, due date, and attachment.',
  component: CreateIssueForm,
});
