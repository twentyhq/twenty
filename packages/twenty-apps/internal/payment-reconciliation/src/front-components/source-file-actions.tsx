import { useState } from 'react';
import { defineFrontComponent, useRecordId } from 'twenty-sdk';

import { SOURCE_FILE_ACTIONS_FRONT_COMPONENT_ID } from 'src/constants/universal-identifiers';

type ActionResult = {
  action: string;
  success: boolean;
  message: string;
};

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

const formatResult = (data: unknown): string => {
  if (typeof data !== 'object' || data === null) return String(data);

  const obj = data as Record<string, unknown>;

  // Format known response shapes
  if ('queued' in obj && obj.queued) {
    return 'Queued for processing — cleanup and parsing will run in the background';
  }

  if ('rowsParsed' in obj) {
    return `Parsed ${obj.rowsParsed} rows (${obj.rowsDeleted} old rows deleted)`;
  }

  if ('autoMatched' in obj) {
    if (obj.skipped) return `Skipped: ${obj.existingCount} results already exist`;

    return `${obj.autoMatched} auto-matched, ${obj.needsReview} needs review, ${obj.unmatched} unmatched`;
  }

  if ('applied' in obj) {
    return `${obj.applied} applied, ${obj.failed} failed, ${obj.skipped} skipped`;
  }

  return JSON.stringify(data);
};

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
};

const ACTIONS = [
  { key: 'parse', label: 'Re-Parse', path: 'reparse-bob', fireAndForget: true },
  { key: 'match', label: 'Run Matching', path: 'match-bob', fireAndForget: true },
  { key: 'apply', label: 'Apply Updates', path: 'apply-status-updates', fireAndForget: false },
] as const;

const SourceFileActions = () => {
  const recordId = useRecordId();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  if (!recordId) {
    return (
      <div style={styles.container}>
        <p>No record context available.</p>
      </div>
    );
  }

  const handleAction = async (
    action: string,
    path: string,
    fireAndForget: boolean,
  ) => {
    setLoading(action);
    setResult(null);

    const { apiUrl, token } = getApiConfig();

    if (fireAndForget) {
      // Fire the request but don't wait for it to complete
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
      setLoading(null);

      return;
    }

    try {
      const response = await triggerEndpoint(apiUrl, token, path, recordId);

      if (response.ok) {
        setResult({
          action,
          success: true,
          message: formatResult(response.data),
        });
      } else {
        const errMsg =
          typeof response.data === 'object' && response.data !== null
            ? JSON.stringify(response.data)
            : String(response.data);

        setResult({
          action,
          success: false,
          message: errMsg,
        });
      }
    } catch (error) {
      setResult({
        action,
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    setLoading(null);
  };

  return (
    <div style={styles.container}>
      <p style={styles.title}>Pipeline Actions</p>
      <div style={styles.buttonRow}>
        {ACTIONS.map(({ key, label, path, fireAndForget }) => (
          <button
            key={key}
            style={loading ? styles.buttonDisabled : styles.button}
            onClick={() => handleAction(key, path, fireAndForget)}
            disabled={!!loading}
          >
            {loading === key ? `${label}...` : label}
          </button>
        ))}
      </div>
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
    'Action buttons for triggering reconciliation pipeline steps on a source file',
  component: SourceFileActions,
});
