import { useEffect, useRef, useState } from 'react';
import { defineFrontComponent, useRecordId } from 'twenty-sdk';

import { SOURCE_FILE_ACTIONS_FRONT_COMPONENT_ID } from 'src/constants/universal-identifiers';

type ActionResult = {
  action: string;
  success: boolean;
  message: string;
};

type ParseStatus =
  | 'PENDING'
  | 'PARSING'
  | 'COMPLETED'
  | 'MATCHING'
  | 'MATCHED'
  | 'APPLYING'
  | 'DONE'
  | 'FAILED'
  | null;

const getApiConfig = () => {
  const proc = (globalThis as Record<string, unknown>)['process'] as
    | { env?: Record<string, string> }
    | undefined;

  return {
    apiUrl: proc?.env?.['TWENTY_API_URL'] ?? '',
    token: proc?.env?.['TWENTY_APP_ACCESS_TOKEN'] ?? '',
  };
};

const triggerEndpoint = async (
  apiUrl: string,
  token: string,
  path: string,
  sourceFileId: string,
): Promise<{ ok: boolean; data: unknown }> => {
  const response = await fetch(`${apiUrl}/s/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ sourceFileId }),
  });

  const data = await response.json();

  return { ok: response.ok, data };
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string; isTransient: boolean }
> = {
  PENDING: {
    label: 'Waiting to start parsing...',
    color: '#344054',
    bgColor: '#f2f4f7',
    borderColor: '#d0d5dd',
    isTransient: true,
  },
  PARSING: {
    label: 'Parsing file rows... (1-2 min)',
    color: '#175cd3',
    bgColor: '#eff8ff',
    borderColor: '#b2ddff',
    isTransient: true,
  },
  COMPLETED: {
    label: 'Parsed! Matching starting automatically...',
    color: '#175cd3',
    bgColor: '#eff8ff',
    borderColor: '#b2ddff',
    isTransient: true,
  },
  MATCHING: {
    label: 'Running matching engine... (2-5 min)',
    color: '#175cd3',
    bgColor: '#eff8ff',
    borderColor: '#b2ddff',
    isTransient: true,
  },
  MATCHED: {
    label: 'Matching complete! Review results, then Apply Updates.',
    color: '#067647',
    bgColor: '#ecfdf3',
    borderColor: '#abefc6',
    isTransient: false,
  },
  APPLYING: {
    label: 'Applying approved changes to CRM...',
    color: '#175cd3',
    bgColor: '#eff8ff',
    borderColor: '#b2ddff',
    isTransient: true,
  },
  DONE: {
    label: 'All done! Changes applied to CRM.',
    color: '#067647',
    bgColor: '#ecfdf3',
    borderColor: '#abefc6',
    isTransient: false,
  },
  FAILED: {
    label: 'Pipeline failed',
    color: '#b42318',
    bgColor: '#fef3f2',
    borderColor: '#fecdca',
    isTransient: false,
  },
};

const TRANSIENT_STATUSES = new Set<string>([
  'PENDING',
  'PARSING',
  'COMPLETED',
  'MATCHING',
  'APPLYING',
]);

const POLL_INTERVAL_MS = 5000;

const styles = {
  container: {
    padding: '16px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '13px',
  } as const,
  title: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  } as const,
  banner: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as const,
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid currentColor',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  } as const,
  buttonRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  } as const,
  button: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #d0d5dd',
    borderRadius: '6px',
    background: '#fff',
    color: '#344054',
    cursor: 'pointer',
  } as const,
  buttonDisabled: {
    padding: '6px 14px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #e4e7ec',
    borderRadius: '6px',
    background: '#f9fafb',
    color: '#98a2b3',
    cursor: 'not-allowed',
  } as const,
  result: {
    marginTop: '10px',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    lineHeight: '1.4',
  } as const,
  success: {
    background: '#ecfdf3',
    color: '#067647',
    border: '1px solid #abefc6',
  } as const,
  error: {
    background: '#fef3f2',
    color: '#b42318',
    border: '1px solid #fecdca',
  } as const,
  errorDetail: {
    marginTop: '4px',
    fontSize: '12px',
    color: '#b42318',
    fontStyle: 'italic',
  } as const,
};

const SourceFileActions = () => {
  const recordId = useRecordId();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    if (!recordId) return;

    const { apiUrl, token } = getApiConfig();

    try {
      const response = await fetch(`${apiUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query: `query GetSourceFileStatus($id: UUID!) {
            payReconSourceFile(id: $id) {
              parseStatus
              parseError
            }
          }`,
          variables: { id: recordId },
        }),
      });

      const json = await response.json();
      const sf = json?.data?.payReconSourceFile;

      if (sf) {
        setParseStatus(sf.parseStatus as ParseStatus);
        setParseError(sf.parseError ?? null);
      }
    } catch {
      // Silently ignore polling errors
    }
  };

  useEffect(() => {
    fetchStatus();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordId]);

  // Start/stop polling based on transient status
  useEffect(() => {
    if (parseStatus && TRANSIENT_STATUSES.has(parseStatus)) {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseStatus]);

  if (!recordId) {
    return (
      <div style={styles.container}>
        <p>No record context available.</p>
      </div>
    );
  }

  const handleAction = async (action: string, path: string) => {
    setResult(null);

    const { apiUrl, token } = getApiConfig();

    // Fire-and-forget — the logic function executor adds ~15s overhead
    // but the actual work is async (DB event chain), so don't wait
    fetch(`${apiUrl}/s/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sourceFileId: recordId }),
    }).catch(() => {
      // Silently ignore — the job runs server-side regardless
    });

    setResult({
      action,
      success: true,
      message: 'Queued — processing will run in the background',
    });

    // Start polling to pick up status changes
    setTimeout(fetchStatus, 2000);
  };

  const statusConfig = parseStatus ? STATUS_CONFIG[parseStatus] : null;
  const isTransient = parseStatus
    ? TRANSIENT_STATUSES.has(parseStatus)
    : false;

  // Determine which buttons to show based on status
  // When status is null (fetch failed), show all buttons as fallback
  const statusUnknown = parseStatus === null;
  const showReparse =
    statusUnknown ||
    parseStatus === 'DONE' ||
    parseStatus === 'FAILED' ||
    parseStatus === 'MATCHED';
  const showReRunMatching =
    statusUnknown ||
    parseStatus === 'MATCHED' ||
    parseStatus === 'FAILED';
  const showApplyUpdates = statusUnknown || parseStatus === 'MATCHED';
  const showNoButtons = !statusUnknown && isTransient;

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={styles.title}>Pipeline Actions</p>

      {statusConfig && (
        <div
          style={{
            ...styles.banner,
            color: statusConfig.color,
            backgroundColor: statusConfig.bgColor,
            border: `1px solid ${statusConfig.borderColor}`,
          }}
        >
          {isTransient && <span style={styles.spinner} />}
          <span>
            {parseStatus === 'FAILED' && parseError
              ? `Failed: ${parseError}`
              : statusConfig.label}
          </span>
        </div>
      )}

      {!showNoButtons && (
        <div style={styles.buttonRow}>
          {showReparse && (
            <button
              style={loading ? styles.buttonDisabled : styles.button}
              onClick={() => handleAction('parse', 'reparse-bob')}
              disabled={!!loading}
            >
              Parse
            </button>
          )}
          {showReRunMatching && (
            <button
              style={loading ? styles.buttonDisabled : styles.button}
              onClick={() => handleAction('match', 'match-bob')}
              disabled={!!loading}
            >
              Run Matching
            </button>
          )}
          {showApplyUpdates && (
            <button
              style={loading ? styles.buttonDisabled : styles.button}
              onClick={() => handleAction('apply', 'apply-status-updates')}
              disabled={!!loading}
            >
              Apply Updates
            </button>
          )}
        </div>
      )}

      {result && (
        <div
          style={{
            ...styles.result,
            ...(result.success ? styles.success : styles.error),
          }}
        >
          {result.message}
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SOURCE_FILE_ACTIONS_FRONT_COMPONENT_ID,
  name: 'source-file-actions',
  description:
    'Status-aware action buttons for the reconciliation pipeline with auto-polling',
  component: SourceFileActions,
});
