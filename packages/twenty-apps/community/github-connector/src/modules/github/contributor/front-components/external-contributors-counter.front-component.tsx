import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { callAppRoute } from 'src/modules/shared/call-app-route';

type Response = {
  count: number;
  rangeStart: string;
  rangeEnd: string;
  truncated: boolean;
  error?: string;
};

const FONT_FAMILY =
  '"Salesforce Sans", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    padding: '12px 14px',
    fontFamily: FONT_FAMILY,
    color: '#181818',
    background: '#FFFFFF',
    overflow: 'hidden',
  } as const,
  number: {
    fontSize: 32,
    fontWeight: 400,
    color: '#181818',
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    marginTop: 4,
  } as const,
  loading: {
    fontSize: 14,
    color: '#706E6B',
    marginTop: 4,
  } as const,
  hint: {
    fontSize: 11,
    color: '#706E6B',
    marginTop: 'auto',
  } as const,
  error: {
    fontSize: 12,
    color: '#BA0517',
    marginTop: 4,
  } as const,
};

const ExternalContributorsCounter = () => {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = (await callAppRoute(
          '/contributors/external-this-month',
          {},
        )) as Response;
        if (cancelled) return;
        if (res.error) {
          setError(res.error);
          setData(null);
        } else {
          setData(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={styles.root}>
      {loading && <div style={styles.loading}>Loading…</div>}
      {error && <div style={styles.error}>{error}</div>}
      {data && <div style={styles.number}>{data.count.toLocaleString()}</div>}
      {data && (
        <div style={styles.hint}>
          {data.truncated ? 'Partial (very large dataset)' : 'This month'}
        </div>
      )}
    </div>
  );
};

export const EXTERNAL_CONTRIBUTORS_COUNTER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'f4e8c1a2-9b3d-4f7e-8c5a-1d2b3c4e5f60';

export default defineFrontComponent({
  universalIdentifier:
    EXTERNAL_CONTRIBUTORS_COUNTER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'External Contributors (this month)',
  description:
    'Big-number counter of distinct external engineers (bots excluded) who authored at least one PR merged in the current calendar month.',
  component: ExternalContributorsCounter,
});
