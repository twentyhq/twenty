import { defineFrontComponent } from 'twenty-sdk/define';
import { useEffect, useRef, useState } from 'react';
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
    return '#e5484d';
  }
  if (line.startsWith('WARN ')) {
    return '#f2b90c';
  }
  return '#a0a0a0';
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

  // Keep the log panel scrolled to the newest line as it grows.
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [status?.logs.length]);

  const stageLabel = status ? (STAGE_LABELS[status.stage] ?? `Stage ${status.stage}`) : null;
  const isComplete = status?.stage === 9;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        gap: '16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#333' }}>
          Migration status
        </h2>
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#fff',
            background: starting ? '#88a9e8' : '#1961ed',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: starting ? 'not-allowed' : 'pointer',
          }}
        >
          <IconPlayerPlay color="#fff" size="16px" />
          {starting ? 'Starting…' : 'Start migration'}
        </button>
      </div>
      {(error !== null || startError !== null) && (
        <p style={{ fontSize: '13px', color: '#e5484d', margin: 0 }}>{startError ?? error}</p>
      )}

      {status !== null && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isComplete ? '#2ecc71' : '#1961ed',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
              {stageLabel}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {status.estimate === null
              ? 'Time estimate not yet available.'
              : `Estimated ~${status.estimate.estimatedMinutes} minute(s) worst case (${status.estimate.batchableRecordCount} record(s) via createManyRecords, ${status.estimate.otherRecordCount} attachment(s))`}
          </span>
        </div>
      )}

      <div
        ref={logsRef}
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#1c1c1c',
          borderRadius: '8px',
          padding: '12px 16px',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '12px',
          lineHeight: '1.6',
        }}
      >
        {status === null || status.logs.length === 0 ? (
          <span style={{ color: '#777' }}>No logs yet.</span>
        ) : (
          status.logs.map((line, index) => (
            <div key={index} style={{ color: logLineColor(line), whiteSpace: 'pre-wrap' }}>
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
