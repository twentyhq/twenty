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

const STATE_TYPE_ICONS: Record<string, string> = {
  backlog: '○',
  unstarted: '○',
  started: '◐',
  completed: '●',
  cancelled: '✕',
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
  (fn: (value: string) => void) => (e: React.SyntheticEvent<HTMLElement>) => {
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

const COLOR = {
  bg: '#f1f1f1',
  card: '#ffffff',
  surface: '#fcfcfc',
  border: '#ebebeb',
  borderStrong: '#d6d6d6',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  placeholder: '#cccccc',
  accent: '#606acc',
  error: '#e05252',
};

const INLINE_SELECT: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none' as const,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  outline: 'none',
  padding: 0,
};

const STYLES = {
  outer: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  container: {
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    boxSizing: 'border-box' as const,
    color: COLOR.text,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: `1px solid ${COLOR.border}`,
    flexShrink: 0,
  },
  teamSelect: {
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    borderRadius: '6px',
    padding: '3px 8px',
    color: COLOR.text,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    overflow: 'auto',
    minHeight: 0,
    gap: '10px',
  },
  titleInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: COLOR.text,
    fontSize: '20px',
    fontWeight: 500,
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    marginBottom: '4px',
  },
  descriptionInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: COLOR.text,
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    resize: 'none' as const,
    flex: 1,
  },
  labelPicker: {
    flexShrink: 0,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    borderBottom: `1px solid ${COLOR.border}`,
  },
  optionsLoadingIndicator: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: `2px solid ${COLOR.border}`,
    borderTopColor: COLOR.textSecondary,
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '5px',
    alignItems: 'center',
  },
  chip: {
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: 'transparent',
    border: `1px solid ${COLOR.border}`,
    borderRadius: '20px',
    padding: '3px 9px',
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap' as const,
    lineHeight: '16px',
  },
  chipIcon: {
    fontSize: '10px',
    lineHeight: 1,
    flexShrink: 0,
  },
  labelsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
    alignItems: 'center',
  },
  labelToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 7px',
    borderRadius: '20px',
    border: `1px solid ${COLOR.border}`,
    fontSize: '11px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    background: 'transparent',
    color: COLOR.textSecondary,
  },
  labelToggleSelected: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 7px',
    borderRadius: '20px',
    border: `1px solid ${COLOR.accent}`,
    fontSize: '11px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    backgroundColor: '#eef0fb',
    color: COLOR.accent,
  },
  labelDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  dateChip: {
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: 'transparent',
    border: `1px solid ${COLOR.border}`,
    borderRadius: '20px',
    padding: '3px 9px',
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    lineHeight: '16px',
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    padding: '6px 12px',
    borderTop: `1px solid ${COLOR.border}`,
    flexShrink: 0,
  },
  cancelButton: {
    background: 'transparent',
    border: 'none',
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '6px',
  },
  createButton: {
    background: COLOR.accent,
    border: 'none',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 14px',
    borderRadius: '6px',
  },
  createButtonDisabled: {
    background: COLOR.borderStrong,
    color: COLOR.textTertiary,
    cursor: 'not-allowed',
  },
  successOuter: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    boxSizing: 'border-box' as const,
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    color: COLOR.text,
  },
  successCheck: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#2ea043',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#fff',
    flexShrink: 0,
  },
  issueLink: {
    color: COLOR.accent,
    fontWeight: 500,
    textDecoration: 'underline',
    fontSize: '13px',
    textUnderlineOffset: '2px',
    flex: 1,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  closeButton: {
    background: 'transparent',
    border: `1px solid ${COLOR.border}`,
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 14px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  loadingOuter: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  loadingContainer: {
    color: COLOR.textSecondary,
    fontSize: '13px',
    textAlign: 'center' as const,
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOuter: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  errorContainer: {
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  errorText: {
    color: COLOR.error,
    fontSize: '12px',
  },
  retryButton: {
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    color: COLOR.text,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 12px',
    borderRadius: '6px',
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
  const [showLabels, setShowLabels] = useState(false);

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

      const todoState = issueOptions.states.find((s) => s.type === 'unstarted');

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
    const trimmedTitle = (title ?? '').trim();

    if (!teamId || !trimmedTitle) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await callAppRoute('/linear/issues', 'POST', {
        teamId,
        title: trimmedTitle,
        description: (description ?? '').trim() || undefined,
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
      <div style={STYLES.successOuter}>
        <div style={STYLES.successContainer}>
          <div style={STYLES.successCheck}>{'✓'}</div>
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
            style={STYLES.closeButton}
            onClick={handleCancel}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (teamsLoading) {
    return (
      <div style={STYLES.loadingOuter}>
        <div style={STYLES.loadingContainer}>Loading...</div>
      </div>
    );
  }

  if (teamsError) {
    return (
      <div style={STYLES.errorOuter}>
        <div style={STYLES.errorContainer}>
          <p style={STYLES.errorText}>{teamsError}</p>
          <button type="button" style={STYLES.retryButton} onClick={fetchTeams}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = teamId && (title ?? '').trim() && !submitting;
  const hasEstimates = options.estimationType !== 'notUsed';
  const baseEstimateOptions = ESTIMATE_SCALES[options.estimationType] ?? [];
  const estimateOptions =
    options.estimationAllowZero &&
    baseEstimateOptions.length > 0 &&
    !baseEstimateOptions.some((o) => o.value === 0)
      ? [{ value: 0, label: 'None' }, ...baseEstimateOptions]
      : baseEstimateOptions;

  const selectedState = options.states.find((s) => s.id === stateId);
  const stateIcon =
    STATE_TYPE_ICONS[selectedState?.type ?? ''] ?? STATE_TYPE_ICONS.unstarted;
  const labelsCount = selectedLabelIds.length;

  const hasStatuses = options.states.length > 0;

  return (
    <div style={STYLES.outer}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={STYLES.container}>
        {/* Top bar with team selector */}
        <div style={STYLES.topBar}>
          <select
            value={teamId}
            onChange={onValueChange(handleTeamChange)}
            style={STYLES.teamSelect}
          >
            <option value="">Select team...</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.key} - {team.name}
              </option>
            ))}
          </select>
          {optionsLoading && (
            <div style={STYLES.optionsLoadingIndicator}>
              <div style={STYLES.spinner} />
            </div>
          )}
        </div>

        {/* Property chips & labels */}
        <div style={STYLES.labelPicker}>
          <div style={STYLES.chipsRow}>
            {/* Status */}
            {hasStatuses && !optionsLoading && (
              <label style={STYLES.chip}>
                <span style={STYLES.chipIcon}>{stateIcon}</span>
                <select
                  value={stateId}
                  onChange={onValueChange(setStateId)}
                  style={INLINE_SELECT}
                  disabled={!teamId || optionsLoading}
                >
                  {options.states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Priority */}
            <label style={STYLES.chip}>
              <span style={STYLES.chipIcon}>{'≡'}</span>
              <select
                value={priority}
                onChange={onValueChange(setPriority)}
                style={INLINE_SELECT}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Assignee */}
            <label style={STYLES.chip}>
              <span style={STYLES.chipIcon}>{'⬤'}</span>
              <select
                value={assigneeId}
                onChange={onValueChange(setAssigneeId)}
                style={INLINE_SELECT}
                disabled={!teamId || optionsLoading}
              >
                <option value="">Assignee</option>
                {options.members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </label>

            {/* Estimate */}
            {hasEstimates && (
              <label style={STYLES.chip}>
                <span style={STYLES.chipIcon}>{'△'}</span>
                <select
                  value={estimate}
                  onChange={onValueChange(setEstimate)}
                  style={INLINE_SELECT}
                  disabled={!teamId || optionsLoading}
                >
                  <option value="">Estimate</option>
                  {estimateOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Labels toggle */}
            {options.labels.length > 0 && (
              <button
                type="button"
                style={{
                  ...STYLES.chip,
                  ...(labelsCount > 0
                    ? { borderColor: COLOR.borderStrong, color: COLOR.text }
                    : {}),
                }}
                onClick={() => setShowLabels((prev) => !prev)}
              >
                <span style={STYLES.chipIcon}>{'■'}</span>
                {labelsCount > 0
                  ? `${labelsCount} Label${labelsCount > 1 ? 's' : ''}`
                  : 'Labels'}
              </button>
            )}

            {/* Cycle */}
            {options.cycles.length > 0 && (
              <label style={STYLES.chip}>
                <span style={STYLES.chipIcon}>{'▶'}</span>
                <select
                  value={cycleId}
                  onChange={onValueChange(setCycleId)}
                  style={INLINE_SELECT}
                  disabled={!teamId || optionsLoading}
                >
                  <option value="">Cycle</option>
                  {options.cycles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name ?? `Cycle ${c.number}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Due date */}
            <input
              value={dueDate}
              onChange={onValueChange(setDueDate)}
              style={STYLES.dateChip}
              type="date"
            />

            {/* Project */}
            {options.projects.length > 0 && (
              <label style={STYLES.chip}>
                <span style={STYLES.chipIcon}>{'⬡'}</span>
                <select
                  value={projectId}
                  onChange={onValueChange(setProjectId)}
                  style={INLINE_SELECT}
                  disabled={!teamId || optionsLoading}
                >
                  <option value="">Project</option>
                  {options.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {showLabels && options.labels.length > 0 && (
            <div style={STYLES.labelsRow}>
              {options.labels.map((label) => {
                const isSelected = selectedLabelIds.includes(label.id);

                return (
                  <button
                    key={label.id}
                    type="button"
                    style={
                      isSelected
                        ? STYLES.labelToggleSelected
                        : STYLES.labelToggle
                    }
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
          )}
        </div>

        <div style={STYLES.body}>
          <input
            value={title}
            onInput={onValueChange(setTitle)}
            onChange={onValueChange(setTitle)}
            style={STYLES.titleInput}
            type="text"
            placeholder="Issue title"
          />
          <textarea
            value={description}
            onInput={onValueChange(setDescription)}
            onChange={onValueChange(setDescription)}
            style={STYLES.descriptionInput}
            placeholder="Add description... (markdown supported)"
          />
        </div>

        <div style={STYLES.actionBar}>
          <button
            type="button"
            style={STYLES.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              ...STYLES.createButton,
              ...(!canSubmit ? STYLES.createButtonDisabled : {}),
            }}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? 'Creating...' : 'Create issue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: CREATE_ISSUE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'create-linear-issue-form',
  description:
    'Form to create a Linear issue with team, title, description, status, priority, assignee, project, cycle, estimate, labels, and due date.',
  component: CreateIssueForm,
});
