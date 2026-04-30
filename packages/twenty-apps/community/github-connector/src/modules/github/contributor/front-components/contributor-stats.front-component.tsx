import { useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  objectMetadataItem,
  useRecordId,
} from 'twenty-sdk/front-component';

import { THEME } from 'src/modules/github/contributor/components/theme';
import { callAppRoute } from 'src/modules/shared/call-app-route';

type Period = 'week' | 'month' | '3months' | 'year';

type Bucket = {
  key: string;
  label: string;
  start: string;
  end: string;
  prAuthored: number;
  prMerged: number;
  prReviewed: number;
};

type ContributorInfo = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
};

type StatsResponse = {
  contributor: ContributorInfo;
  period: Period;
  granularity: 'day' | 'week' | 'month';
  buckets: Bucket[];
  totals: { prAuthored: number; prMerged: number; prReviewed: number };
  truncated: {
    prAuthored: boolean;
    prMerged: boolean;
    prReviewed: boolean;
  };
  error?: string;
};

type SearchResponse = {
  contributors: ContributorInfo[];
};

const readSerializedValue = (
  e: React.SyntheticEvent<HTMLElement>,
): string | undefined => {
  const obj = e as { detail?: { value?: string }; value?: string };
  if (typeof obj.detail?.value === 'string') return obj.detail.value;
  if (typeof obj.value === 'string') return obj.value;
  return undefined;
};

const onValueChange =
  (fn: (value: string) => void) =>
  (e: React.SyntheticEvent<HTMLElement>) => {
    const v = readSerializedValue(e);
    if (typeof v === 'string') fn(v);
  };

const PERIOD_OPTIONS: Array<{ value: Period; label: string }> = [
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
  { value: '3months', label: 'Last 3 months' },
  { value: 'year', label: 'Last year' },
];

const WIDGET_HEADER_HEIGHT = 24;

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 0,
    boxSizing: 'border-box',
    padding: 12,
    gap: 12,
    fontFamily: THEME.fontFamily,
    color: THEME.fontPrimary,
    background: THEME.bgSecondary,
    overflow: 'hidden',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
    padding: '8px 12px',
    background: THEME.bgPrimary,
    border: `1px solid ${THEME.borderLight}`,
    borderRadius: THEME.borderRadius,
    boxSizing: 'border-box',
    flexShrink: 0,
  } as const,
  contributor: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  } as const,
  avatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    objectFit: 'cover',
    background: THEME.bgTertiary,
    flexShrink: 0,
  } as const,
  smallAvatar: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    objectFit: 'cover',
    background: THEME.bgTertiary,
    flexShrink: 0,
  } as const,
  nameCol: {
    display: 'flex',
    alignItems: 'baseline',
    minWidth: 0,
    gap: 6,
    lineHeight: 1.2,
  } as const,
  name: {
    fontSize: 14,
    fontWeight: 500,
    color: THEME.fontPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  login: {
    fontSize: 12,
    fontWeight: 400,
    color: THEME.fontTertiary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  } as const,
  select: {
    fontFamily: THEME.fontFamily,
    fontSize: 13,
    height: 28,
    lineHeight: '26px',
    padding: '0 24px 0 10px',
    border: `1px solid ${THEME.borderMedium}`,
    borderRadius: THEME.borderRadius,
    background: `${THEME.bgPrimary} url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 20 20' fill='gray'><path d='M10 13l-5-5h10z'/></svg>") no-repeat right 8px center`,
    color: THEME.fontPrimary,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
  } as const,
  buttonNeutral: {
    fontFamily: THEME.fontFamily,
    fontSize: 13,
    fontWeight: 500,
    height: 28,
    lineHeight: '26px',
    padding: '0 10px',
    border: `1px solid ${THEME.borderMedium}`,
    borderRadius: THEME.borderRadius,
    background: THEME.bgPrimary,
    color: THEME.fontPrimary,
    cursor: 'pointer',
    outline: 'none',
  } as const,
  body: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    gap: 12,
  } as const,
  chartCard: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    border: `1px solid ${THEME.borderLight}`,
    borderRadius: THEME.borderRadius,
    padding: 8,
    background: THEME.bgPrimary,
    boxSizing: 'border-box',
  } as const,
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: WIDGET_HEADER_HEIGHT,
    padding: '0 4px',
    flexShrink: 0,
  } as const,
  chartTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: THEME.fontPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  chartTotal: {
    fontSize: 13,
    fontWeight: 500,
    color: THEME.fontTertiary,
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  } as const,
  chartContainer: {
    flex: '1 1 0%',
    minHeight: 90,
    width: '100%',
    position: 'relative',
    marginTop: 4,
  } as const,
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: THEME.fontTertiary,
    fontSize: 13,
    textAlign: 'center',
    padding: 16,
  } as const,
  searchWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
    minHeight: 0,
  } as const,
  searchInput: {
    fontFamily: THEME.fontFamily,
    fontSize: 13,
    height: 28,
    padding: '0 10px',
    border: `1px solid ${THEME.borderMedium}`,
    borderRadius: THEME.borderRadius,
    outline: 'none',
    background: THEME.bgPrimary,
    color: THEME.fontPrimary,
  } as const,
  searchList: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    border: `1px solid ${THEME.borderLight}`,
    borderRadius: THEME.borderRadius,
    background: THEME.bgPrimary,
  } as const,
  searchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    cursor: 'pointer',
    borderBottom: `1px solid ${THEME.borderLight}`,
    fontSize: 13,
    color: THEME.fontPrimary,
  } as const,
  truncatedHint: {
    fontSize: 11,
    color: THEME.fontTertiary,
    marginTop: 4,
    paddingLeft: 4,
  } as const,
};

type BarChartProps = {
  buckets: Bucket[];
  valueKey: 'prAuthored' | 'prMerged' | 'prReviewed';
  color: string;
};

const CHART_PADDING = { top: 6, right: 4, bottom: 16, left: 22 };

const BarChart = ({ buckets, valueKey, color }: BarChartProps) => {
  const yMax = useMemo(() => {
    const m = buckets.reduce((acc, b) => Math.max(acc, b[valueKey]), 0);
    if (m === 0) return 1;
    return m <= 5 ? m : Math.ceil(m / 5) * 5;
  }, [buckets, valueKey]);

  const yTicks = useMemo(() => [0, Math.round(yMax / 2), yMax], [yMax]);

  const n = buckets.length;
  const labelEvery = (() => {
    if (n <= 6) return 1;
    if (n <= 14) return 2;
    return Math.ceil(n / 6);
  })();

  return (
    <div style={styles.chartContainer}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: CHART_PADDING.top,
          bottom: CHART_PADDING.bottom,
          width: CHART_PADDING.left,
        }}
      >
        {yTicks.map((t) => {
          const bottomPct = (t / yMax) * 100;
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                right: 4,
                bottom: `${bottomPct}%`,
                transform: 'translateY(50%)',
                fontSize: 10,
                color: THEME.fontTertiary,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {t}
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          left: CHART_PADDING.left,
          right: CHART_PADDING.right,
          top: CHART_PADDING.top,
          bottom: CHART_PADDING.bottom,
        }}
      >
        {yTicks.map((t, i) => {
          const bottomPct = (t / yMax) * 100;
          return (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${bottomPct}%`,
                borderTop: `1px ${i === 0 ? 'solid' : 'dotted'} ${THEME.borderLight}`,
                pointerEvents: 'none',
              }}
            />
          );
        })}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 2,
          }}
        >
          {buckets.map((b, i) => {
            const v = b[valueKey];
            const heightPct = (v / yMax) * 100;
            const showLabel = i % labelEvery === 0 || i === n - 1;
            return (
              <div
                key={b.key}
                title={`${b.label}: ${v}`}
                style={{
                  flex: '1 1 0',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  position: 'relative',
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: '70%',
                    maxWidth: 22,
                    height: `${heightPct}%`,
                    minHeight: v > 0 ? 2 : 0,
                    background: color,
                    borderRadius: '2px 2px 0 0',
                  }}
                />
                {showLabel && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      marginTop: 4,
                      fontSize: 10,
                      color: THEME.fontTertiary,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                      pointerEvents: 'none',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {b.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ContributorStats = () => {
  const recordId = useRecordId();
  const [period, setPeriod] = useState<Period>('month');
  const [selectedId, setSelectedId] = useState<string | null>(recordId);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse['contributors']>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    setSelectedId(recordId);
  }, [recordId]);

  useEffect(() => {
    if (selectedId) return;
    let cancelled = false;
    setSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = (await callAppRoute('/contributors/search', {
          query: searchQuery,
          limit: 20,
        })) as SearchResponse;
        if (!cancelled) setSearchResults(res.contributors ?? []);
      } catch (err) {
        if (!cancelled) {
          enqueueSnackbar({
            message:
              err instanceof Error ? err.message : 'Failed to search contributors',
            variant: 'error',
          });
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [selectedId, searchQuery]);

  useEffect(() => {
    if (!selectedId) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = (await callAppRoute('/contributors/stats', {
          contributorId: selectedId,
          period,
        })) as StatsResponse;
        if (cancelled) return;
        if (res.error) {
          setError(res.error);
          setStats(null);
        } else {
          setStats(res);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stats');
          setStats(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, period]);

  const renderHeader = (contributor: ContributorInfo | null) => (
    <div style={styles.header}>
      <div style={styles.contributor}>
        {contributor?.avatarUrl ? (
          <img src={contributor.avatarUrl} alt="" style={styles.avatar} />
        ) : (
          <div style={styles.avatar} />
        )}
        <div style={styles.nameCol}>
          <span style={styles.name}>
            {contributor?.name ?? contributor?.ghLogin ?? 'Contributor stats'}
          </span>
          {contributor?.ghLogin &&
            contributor.ghLogin !== contributor.name && (
              <span style={styles.login}>@{contributor.ghLogin}</span>
            )}
        </div>
      </div>
      <div style={styles.controls}>
        {selectedId && !recordId && (
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            style={styles.buttonNeutral}
          >
            Change
          </button>
        )}
        <select
          value={period}
          onChange={onValueChange((v) => setPeriod(v as Period))}
          style={styles.select}
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (!selectedId) {
    return (
      <div style={styles.root}>
        {renderHeader(null)}
        <div style={styles.searchWrapper}>
          <input
            value={searchQuery}
            onInput={onValueChange(setSearchQuery)}
            onChange={onValueChange(setSearchQuery)}
            placeholder="Search a contributor by name or GitHub login..."
            style={styles.searchInput}
          />
          <div style={styles.searchList}>
            {searchLoading && searchResults.length === 0 && (
              <div style={{ ...styles.searchItem, color: THEME.fontTertiary }}>
                Searching...
              </div>
            )}
            {!searchLoading && searchResults.length === 0 && (
              <div style={{ ...styles.searchItem, color: THEME.fontTertiary }}>
                No contributors found.
              </div>
            )}
            {searchResults.map((eng) => (
              <div
                key={eng.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(eng.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedId(eng.id);
                }}
                style={styles.searchItem}
              >
                {eng.avatarUrl ? (
                  <img src={eng.avatarUrl} alt="" style={styles.smallAvatar} />
                ) : (
                  <div style={styles.smallAvatar} />
                )}
                <div style={styles.nameCol}>
                  <span style={styles.name}>
                    {eng.name ?? eng.ghLogin ?? 'Unknown'}
                  </span>
                  {eng.ghLogin && eng.ghLogin !== eng.name && (
                    <span style={styles.login}>@{eng.ghLogin}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {renderHeader(stats?.contributor ?? null)}
      <div style={styles.body}>
        {loading && !stats && (
          <div style={styles.centered}>Loading contributor stats...</div>
        )}
        {error && <div style={styles.centered}>{error}</div>}
        {stats && (
          <>
            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>PRs authored (merged)</span>
                <span style={styles.chartTotal}>{stats.totals.prAuthored}</span>
              </div>
              <BarChart
                buckets={stats.buckets}
                valueKey="prAuthored"
                color={THEME.chartAuthored}
              />
              {stats.truncated.prAuthored && (
                <span style={styles.truncatedHint}>
                  Showing partial data (results truncated).
                </span>
              )}
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>PRs merged</span>
                <span style={styles.chartTotal}>{stats.totals.prMerged}</span>
              </div>
              <BarChart
                buckets={stats.buckets}
                valueKey="prMerged"
                color={THEME.chartMerged}
              />
              {stats.truncated.prMerged && (
                <span style={styles.truncatedHint}>
                  Showing partial data (results truncated).
                </span>
              )}
            </div>

            <div style={styles.chartCard}>
              <div style={styles.chartHeader}>
                <span style={styles.chartTitle}>PRs reviewed</span>
                <span style={styles.chartTotal}>{stats.totals.prReviewed}</span>
              </div>
              <BarChart
                buckets={stats.buckets}
                valueKey="prReviewed"
                color={THEME.chartReviewed}
              />
              {stats.truncated.prReviewed && (
                <span style={styles.truncatedHint}>
                  Showing partial data (results truncated).
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: '6c2f1a8d-4b9e-4f7a-9c5d-1e8b2a3d4c5f',
  name: 'Contributor Stats',
  description:
    'Displays time-bucketed charts of PRs authored (merged only), merged and reviewed by a contributor over the last week, month, 3 months or year.',
  component: ContributorStats,
  command: {
    universalIdentifier: '7d3f2b9e-5c0a-4e8b-ad6e-2f9c3b4d5e6a',
    label: 'Contributor Stats',
    icon: 'IconChartBar',
    isPinned: false,
    conditionalAvailabilityExpression:
      objectMetadataItem.nameSingular === 'contributor',
  },
});
