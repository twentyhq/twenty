import { useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { callAppRoute } from 'src/modules/shared/call-app-route';

type LeaderRow = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
  count: number;
};

type MonthBucket = {
  month: string;
  externalPrsMerged: number;
  externalIssuesOpened: number;
};

type Response = {
  rangeStart: string;
  rangeEnd: string;
  monthsBack: number;
  kpis: {
    externalContributorsLifetime: number;
    activeExternalContributorsThisMonth: number;
    externalPrsMergedThisMonth: number;
    externalIssuesOpenedThisMonth: number;
  };
  byMonth: MonthBucket[];
  topMerged: LeaderRow[];
  topReviewed: LeaderRow[];
  truncated: { prs: boolean; issues: boolean; reviews: boolean };
  error?: string;
};

const COLORS = {
  bg: '#F3F2F2',
  surface: '#FFFFFF',
  fg: '#181818',
  textLabel: '#3E3E3C',
  muted: '#706E6B',
  border: '#DDDBDA',
  borderStrong: '#C9C7C5',
  shadow: '0 2px 2px 0 rgba(0,0,0,0.10)',
  community: '#9050E9',
  active: '#0D9488',
  merged: '#04844B',
  issues: '#E07300',
  rowAlt: '#FAFAF9',
} as const;

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
    padding: 12,
    gap: 12,
    fontFamily: FONT_FAMILY,
    color: COLORS.fg,
    background: COLORS.bg,
    overflow: 'auto',
  } as const,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
    padding: '12px 14px',
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    boxShadow: COLORS.shadow,
    boxSizing: 'border-box',
    flexShrink: 0,
  } as const,
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.fg,
    margin: 0,
  } as const,
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
    fontVariantNumeric: 'tabular-nums',
  } as const,
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    flexShrink: 0,
  } as const,
  kpiCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px 14px',
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    boxShadow: COLORS.shadow,
    boxSizing: 'border-box',
    minHeight: 88,
  } as const,
  kpiLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.0625em',
  } as const,
  kpiValue: {
    fontSize: 28,
    fontWeight: 400,
    color: COLORS.fg,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
    marginTop: 6,
  } as const,
  kpiHint: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 'auto',
    paddingTop: 6,
  } as const,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  } as const,
  card: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    background: COLORS.surface,
    boxShadow: COLORS.shadow,
    boxSizing: 'border-box',
    overflow: 'hidden',
  } as const,
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    flexShrink: 0,
  } as const,
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.0625em',
    color: COLORS.fg,
  } as const,
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    fontVariantNumeric: 'tabular-nums',
  } as const,
  chartWrap: {
    padding: 12,
    height: 240,
    boxSizing: 'border-box',
  } as const,
  chart: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: '100%',
    width: '100%',
    borderBottom: `1px solid ${COLORS.borderStrong}`,
    paddingBottom: 22,
    position: 'relative',
  } as const,
  bar: {
    flex: 1,
    minWidth: 4,
    borderRadius: '2px 2px 0 0',
    position: 'relative',
    transition: 'height 0.2s ease',
  } as const,
  barLabel: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.muted,
    fontVariantNumeric: 'tabular-nums',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  } as const,
  barValue: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.fg,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
  } as const,
  thead: {
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 70px',
    gap: 6,
    padding: '6px 12px',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.0625em',
    color: COLORS.textLabel,
    borderBottom: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    flexShrink: 0,
  } as const,
  scrollArea: {
    overflowY: 'auto',
    flex: 1,
    minHeight: 0,
  } as const,
  row: {
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 70px',
    gap: 6,
    alignItems: 'center',
    padding: '6px 12px',
    fontSize: 12,
    color: COLORS.fg,
    borderBottom: `1px solid ${COLORS.border}`,
  } as const,
  rowAlt: { background: COLORS.rowAlt } as const,
  rank: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.muted,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  } as const,
  contributor: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  } as const,
  avatar: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    objectFit: 'cover',
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  } as const,
  nameCol: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    lineHeight: 1.15,
  } as const,
  name: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.fg,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  login: {
    fontSize: 10,
    color: COLORS.muted,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as const,
  cellNum: {
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'right',
    fontWeight: 600,
  } as const,
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    padding: 16,
  } as const,
  errorBox: {
    fontSize: 12,
    color: '#BA0517',
    padding: 12,
    background: '#FFF5F4',
    border: '1px solid #F8C0BD',
    borderRadius: 4,
  } as const,
  hint: {
    fontSize: 11,
    color: COLORS.muted,
    padding: '6px 14px',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 4,
    background: COLORS.surface,
    flexShrink: 0,
  } as const,
};

const formatNumber = (n: number) => n.toLocaleString();

const formatMonthShort = (yyyymm: string): string => {
  const [y, m] = yyyymm.split('-').map(Number);
  if (!y || !m) return yyyymm;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });
};

type KpiCardProps = {
  label: string;
  value: number;
  hint: string;
  color: string;
};

const KpiCard = ({ label, value, hint, color }: KpiCardProps) => (
  <div style={styles.kpiCard}>
    <span style={styles.kpiLabel}>{label}</span>
    <span style={{ ...styles.kpiValue, color }}>{formatNumber(value)}</span>
    <span style={styles.kpiHint}>{hint}</span>
  </div>
);

type BarChartProps = {
  buckets: MonthBucket[];
  valueKey: 'externalPrsMerged' | 'externalIssuesOpened';
  color: string;
};

const BarChart = ({ buckets, valueKey, color }: BarChartProps) => {
  const max = useMemo(() => {
    let m = 0;
    for (const b of buckets) {
      if (b[valueKey] > m) m = b[valueKey];
    }
    return m;
  }, [buckets, valueKey]);

  if (buckets.length === 0) {
    return <div style={styles.centered}>No data.</div>;
  }

  return (
    <div style={styles.chartWrap}>
      <div style={styles.chart}>
        {buckets.map((b, i) => {
          const v = b[valueKey];
          const heightPct = max > 0 ? Math.max((v / max) * 100, v > 0 ? 2 : 0) : 0;
          // Show year-month label on first bucket and every January
          const showYear =
            i === 0 || b.month.endsWith('-01') || i === buckets.length - 1;
          const label = showYear
            ? `${formatMonthShort(b.month)} ${b.month.slice(2, 4)}`
            : formatMonthShort(b.month);
          return (
            <div
              key={b.month}
              style={{
                ...styles.bar,
                height: `${heightPct}%`,
                background: color,
                opacity: v === 0 ? 0.15 : 1,
              }}
              title={`${b.month}: ${v}`}
            >
              {v > 0 && max > 0 && v / max > 0.6 && (
                <span style={styles.barValue}>{v}</span>
              )}
              <span style={styles.barLabel}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type LeaderboardCardProps = {
  title: string;
  subtitle: string;
  rows: LeaderRow[];
  color: string;
  loading: boolean;
  emptyLabel: string;
  heading: string;
};

const LeaderboardCard = ({
  title,
  subtitle,
  rows,
  color,
  loading,
  emptyLabel,
  heading,
}: LeaderboardCardProps) => (
  <div style={styles.card}>
    <div style={styles.cardHeader}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardSubtitle}>{subtitle}</div>
    </div>
    <div style={styles.thead}>
      <div style={{ textAlign: 'center' }}>#</div>
      <div>Contributor</div>
      <div style={{ textAlign: 'right' }}>{heading}</div>
    </div>
    <div style={styles.scrollArea}>
      {loading && rows.length === 0 && (
        <div style={styles.centered}>Loading...</div>
      )}
      {!loading && rows.length === 0 && (
        <div style={styles.centered}>{emptyLabel}</div>
      )}
      {rows.map((r, i) => (
        <div
          key={r.id}
          style={{
            ...styles.row,
            ...(i % 2 === 1 ? styles.rowAlt : {}),
          }}
        >
          <div style={styles.rank}>{i + 1}</div>
          <div style={styles.contributor}>
            {r.avatarUrl ? (
              <img src={r.avatarUrl} alt="" style={styles.avatar} />
            ) : (
              <div style={styles.avatar} />
            )}
            <div style={styles.nameCol}>
              <span style={styles.name}>
                {r.name ?? r.ghLogin ?? 'Unknown'}
              </span>
              {r.ghLogin && <span style={styles.login}>@{r.ghLogin}</span>}
            </div>
          </div>
          <div style={{ ...styles.cellNum, color }}>
            {formatNumber(r.count)}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ExternalContributionsDashboard = () => {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = (await callAppRoute(
          '/contributors/external-contributions',
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

  const truncatedHint = useMemo(() => {
    if (!data) return null;
    const parts: string[] = [];
    if (data.truncated.prs) parts.push('PRs');
    if (data.truncated.issues) parts.push('issues');
    if (data.truncated.reviews) parts.push('reviews');
    return parts.length > 0
      ? `Showing partial data (${parts.join(', ')} truncated for large dataset).`
      : null;
  }, [data]);

  return (
    <div style={styles.root}>
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitle}>External Contributions</div>
          <div style={styles.headerSubtitle}>
            {data
              ? `Last ${data.monthsBack} months · core team & bots excluded`
              : 'Loading…'}
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.kpiRow}>
        <KpiCard
          label="External Contributors"
          value={data?.kpis.externalContributorsLifetime ?? 0}
          hint="Lifetime"
          color={COLORS.community}
        />
        <KpiCard
          label="Active This Month"
          value={data?.kpis.activeExternalContributorsThisMonth ?? 0}
          hint="With ≥1 PR merged"
          color={COLORS.active}
        />
        <KpiCard
          label="External PRs Merged"
          value={data?.kpis.externalPrsMergedThisMonth ?? 0}
          hint="This month"
          color={COLORS.merged}
        />
        <KpiCard
          label="External Issues Opened"
          value={data?.kpis.externalIssuesOpenedThisMonth ?? 0}
          hint="This month"
          color={COLORS.issues}
        />
      </div>

      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>External PRs Merged per Month</div>
            <div style={styles.cardSubtitle}>
              Last {data?.monthsBack ?? 24} months
            </div>
          </div>
          <BarChart
            buckets={data?.byMonth ?? []}
            valueKey="externalPrsMerged"
            color={COLORS.merged}
          />
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>External Issues Opened per Month</div>
            <div style={styles.cardSubtitle}>
              Last {data?.monthsBack ?? 24} months
            </div>
          </div>
          <BarChart
            buckets={data?.byMonth ?? []}
            valueKey="externalIssuesOpened"
            color={COLORS.issues}
          />
        </div>
      </div>

      <div style={styles.twoCol}>
        <LeaderboardCard
          title="Top External Contributors"
          subtitle={`Top 10 · last ${data?.monthsBack ?? 24} months`}
          rows={data?.topMerged ?? []}
          color={COLORS.merged}
          loading={loading}
          emptyLabel="No external merged PRs in this window."
          heading="Merged"
        />
        <LeaderboardCard
          title="Top External Reviewers"
          subtitle={`Top 10 · last ${data?.monthsBack ?? 24} months`}
          rows={data?.topReviewed ?? []}
          color="#0176D3"
          loading={loading}
          emptyLabel="No external reviews in this window."
          heading="Reviews"
        />
      </div>

      {truncatedHint && <div style={styles.hint}>{truncatedHint}</div>}
    </div>
  );
};

export const EXTERNAL_CONTRIBUTIONS_DASHBOARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'a5d8c1e3-4b27-4f6a-9c08-3e1f5b2a4d76';

export default defineFrontComponent({
  universalIdentifier:
    EXTERNAL_CONTRIBUTIONS_DASHBOARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'External Contributions Dashboard',
  description:
    'Community-focused dashboard celebrating external contributions: lifetime contributor count, this-month KPIs, monthly PR merges and issue openings over the last 24 months, and lifetime top external contributors / reviewers. Core team and bots are excluded.',
  component: ExternalContributionsDashboard,
});
