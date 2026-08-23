import { defineFrontComponent } from 'twenty-sdk/define';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { IconPlayerPlay } from 'twenty-ui/icon';

import { MIGRATION_STATUS_ROUTE_PATH } from 'src/constants/migration-status-route-path';
import { TRIGGER_ROUTE_PATH } from 'src/constants/trigger-route-path';
import { MIGRATION_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const POLL_INTERVAL_MS = 3000;
// The migration handler checkpoints and self-triggers rather than finishing in one call, so it
// can hold this request open for minutes. Stop waiting after a few seconds - polling status is
// what actually reflects progress - rather than blocking the button's loading state on it.
const START_REQUEST_TIMEOUT_MS = 5000;
const theme = {
  spacing2: 'var(--t-spacing-2)',
  spacing3: 'var(--t-spacing-3)',
  spacing4: 'var(--t-spacing-4)',
  spacing6: 'var(--t-spacing-6)',
  spacing8: 'var(--t-spacing-8)',
  bgPrimary: 'var(--t-background-primary)',
  bgSecondary: 'var(--t-background-secondary)',
  bgInverted: 'var(--t-background-inverted-primary)',
  borderLight: 'var(--t-border-color-light)',
  radiusSm: 'var(--t-border-radius-sm)',
  radiusMd: 'var(--t-border-radius-md)',
  fontPrimary: 'var(--t-font-color-primary)',
  fontTertiary: 'var(--t-font-color-tertiary)',
  fontInverted: 'var(--t-font-color-inverted)',
  fontLight: 'var(--t-font-color-light)',
  fontFamily: 'var(--t-font-family)',
  sizeXs: 'var(--t-font-size-xs)',
  sizeSm: 'var(--t-font-size-sm)',
  sizeMd: 'var(--t-font-size-md)',
  sizeLg: 'var(--t-font-size-lg)',
  weightMedium: 'var(--t-font-weight-medium)',
  weightSemiBold: 'var(--t-font-weight-semi-bold)',
  blue: 'var(--t-color-blue)',
  red: 'var(--t-color-red)',
  yellow: 'var(--t-color-yellow)',
  green: 'var(--t-color-green)',
};

const STAGE_LABELS: Record<number, string> = {
  1: 'Checking apps & workspace members, estimating duration',
  2: 'Syncing schema (objects & fields)',
  3: 'Migrating records',
  4: 'Migrating views',
  5: 'Migrating dashboards',
  6: 'Migrating record page layouts',
  7: 'Migrating navigation menu items, skills, webhooks & roles',
  8: 'Migrating attachments',
  9: 'Complete',
};

type MigrationEstimate = {
  estimatedMinutes: number;
  batchableRecordCount: number;
  otherRecordCount: number;
};

type MigrationStatusResponse = {
  stage: number;
  estimate: MigrationEstimate | null;
  logs: string[];
};

const logLineColor = (line: string): string => {
  if (line.startsWith('ERROR ')) {
    return theme.red;
  }
  if (line.startsWith('WARN ')) {
    return theme.yellow;
  }
  return theme.fontLight;
};

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: theme.spacing6,
    gap: theme.spacing4,
    fontFamily: theme.fontFamily,
    background: theme.bgPrimary,
    color: theme.fontPrimary,
    boxSizing: 'border-box',
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: theme.sizeLg, fontWeight: theme.weightSemiBold, margin: 0 },
  startButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing2,
    height: theme.spacing8,
    padding: `0 ${theme.spacing3}`,
    fontSize: theme.sizeSm,
    fontFamily: theme.fontFamily,
    fontWeight: theme.weightMedium,
    color: theme.fontInverted,
    background: theme.blue,
    border: 'none',
    borderRadius: theme.radiusSm,
  },
  error: { fontSize: theme.sizeSm, color: theme.red, margin: 0 },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing2,
    padding: theme.spacing4,
    borderRadius: theme.radiusMd,
    border: `1px solid ${theme.borderLight}`,
    background: theme.bgSecondary,
  },
  stageRow: { display: 'flex', alignItems: 'center', gap: theme.spacing2 },
  stageDot: { width: theme.spacing2, height: theme.spacing2, borderRadius: '50%', flexShrink: 0 },
  stageLabel: { fontSize: theme.sizeSm, fontWeight: theme.weightMedium },
  estimate: { fontSize: theme.sizeXs, color: theme.fontTertiary },
  logs: {
    flex: 1,
    overflow: 'auto',
    background: theme.bgInverted,
    borderRadius: theme.radiusMd,
    padding: theme.spacing3,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: theme.sizeXs,
    lineHeight: 1.6,
  },
  logLine: { whiteSpace: 'pre-wrap' },
  logsEmpty: { color: theme.fontTertiary },
};

const MigrationStatus = () => {
  const [status, setStatus] = useState<MigrationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);

  const handleStart = async () => {
    setStarting(true);
    setStartError(null);
    try {
      await new RestApiClient().post(`/s${TRIGGER_ROUTE_PATH}`, undefined, {
        signal: AbortSignal.timeout(START_REQUEST_TIMEOUT_MS),
      });
    } catch (startRequestError) {
      const isTimeout = startRequestError instanceof Error
        && (startRequestError.name === 'TimeoutError' || startRequestError.name === 'AbortError');
      if (!isTimeout) {
        setStartError(startRequestError instanceof Error ? startRequestError.message : 'Failed to start migration.');
      }
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await new RestApiClient().get<MigrationStatusResponse>(
          `/s${MIGRATION_STATUS_ROUTE_PATH}`,
        );
        if (!cancelled) {
          setStatus(response);
          setError(null);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load migration status.');
        }
      }
    };

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Depends on the newest line rather than the count: the log tail is capped, so once it
  // saturates the length stops changing while the content keeps moving.
  const lastLogLine = status !== null && status.logs.length > 0 ? status.logs[status.logs.length - 1] : undefined;
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [lastLogLine]);

  const stageLabel = status ? (STAGE_LABELS[status.stage] ?? `Stage ${status.stage}`) : null;
  const isComplete = status?.stage === 9;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Migration status</h2>
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          style={{ ...styles.startButton, cursor: starting ? 'not-allowed' : 'pointer', opacity: starting ? 0.6 : 1 }}
        >
          <IconPlayerPlay color={theme.fontInverted} size={theme.sizeMd} />
          {starting ? 'Starting…' : 'Start migration'}
        </button>
      </div>

      {(error !== null || startError !== null) && (
        <p style={styles.error}>{startError ?? error}</p>
      )}

      {status !== null && (
        <div style={styles.card}>
          <div style={styles.stageRow}>
            <span style={{ ...styles.stageDot, background: isComplete ? theme.green : theme.blue }} />
            <span style={styles.stageLabel}>{stageLabel}</span>
          </div>
          <span style={styles.estimate}>
            {status.estimate === null
              ? 'Time estimate not yet available.'
              : `Estimated ~${status.estimate.estimatedMinutes} minute(s) worst case (${status.estimate.batchableRecordCount} record(s) via createManyRecords, ${status.estimate.otherRecordCount} attachment(s))`}
          </span>
        </div>
      )}

      <div ref={logsRef} style={styles.logs}>
        {status === null || status.logs.length === 0 ? (
          <span style={styles.logsEmpty}>No logs yet.</span>
        ) : (
          status.logs.map((line, index) => (
            <div key={index} style={{ ...styles.logLine, color: logLineColor(line) }}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MIGRATION_STATUS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'migration-status',
  description: 'Shows the current migration stage, time estimate, and recent log lines.',
  component: MigrationStatus,
});
