import { defineFrontComponent } from 'twenty-sdk/define';
import { Callout } from 'twenty-ui/feedback';
import { IconAlertCircle, IconMail, IconRefresh } from 'twenty-ui/icon';
import { type ThemeType, useTheme } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { isDefined } from '@utils/is-defined';

import { PERSON_RESEND_EMAIL_STATS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from '@modules/resend/constants/universal-identifiers';
import {
  EMAIL_STATUS_META_BY_STATUS,
  RESEND_EMAIL_STATUS_DISPLAY_ORDER,
  type ThemeColor,
} from '@modules/resend/email-stats/constants/email-status-groups';
import { usePersonResendEmailStats } from '@modules/resend/email-stats/hooks/usePersonResendEmailStats';

const getDeliverabilityColor = (rate: number): ThemeColor => {
  if (rate >= 0.95) return 'green';
  if (rate >= 0.8) return 'yellow';
  return 'red';
};

const formatRate = (rate: number): string => `${Math.round(rate * 100)}%`;

const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';

  const pct = (value / total) * 100;

  return pct >= 10 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
};

type StatusPillProps = {
  color: ThemeColor;
  text: string;
};

const StatusPill = ({ color, text }: StatusPillProps) => {
  const theme = useTheme();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `0 ${theme.spacing[2]}`,
        height: theme.spacing[5],
        borderRadius: theme.border.radius.sm,
        background: theme.tag.background[color],
        color: theme.tag.text[color],
        fontSize: theme.font.size.xs,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

const PROGRESS_BAR_HEIGHT = '8px';

type MiniProgressBarProps = {
  value: number;
  color: ThemeColor;
};

const MiniProgressBar = ({ value, color }: MiniProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const theme = useTheme();

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'relative',
        width: '100%',
        height: PROGRESS_BAR_HEIGHT,
        borderRadius: theme.border.radius.pill,
        background: theme.tag.background[color],
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: theme.border.radius.pill,
          background: theme.tag.text[color],
          transition: 'width 0.3s linear',
        }}
      />
    </div>
  );
};

const getStyles = (theme: ThemeType): Record<string, React.CSSProperties> => ({
  container: {
    fontFamily: theme.font.family,
    fontSize: theme.font.size.sm,
    color: theme.font.color.primary,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[3],
    boxSizing: 'border-box',
  },
  card: {
    padding: theme.spacing[3],
    borderRadius: theme.border.radius.md,
    background: theme.background.secondary,
    border: `1px solid ${theme.border.color.light}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  h2TitleNoMargin: {
    display: 'flex',
    marginBottom: `calc(-1 * ${theme.spacing[4]})`,
  },
  rateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    color: theme.font.color.secondary,
  },
  rateMeta: {
    fontSize: theme.font.size.xs,
    color: theme.font.color.tertiary,
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[2],
  },
  statusRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(120px, max-content) 1fr auto',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  statusCount: {
    fontVariantNumeric: 'tabular-nums',
    color: theme.font.color.secondary,
    whiteSpace: 'nowrap',
  },
});

const PersonResendEmailStats = () => {
  const { stats, loading, error } = usePersonResendEmailStats();
  const theme = useTheme();
  const styles = getStyles(theme);

  if (loading) {
    return (
      <div style={styles.container}>
        <Callout
          variant="neutral"
          title="Loading email stats"
          description="Computing per-status counts and deliverability\u2026"
          Icon={IconRefresh}
        />
      </div>
    );
  }

  if (isDefined(error)) {
    return (
      <div style={styles.container}>
        <Callout
          variant="error"
          title="Failed to load email stats"
          description={error}
          Icon={IconAlertCircle}
        />
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div style={styles.container}>
        <Callout
          variant="info"
          title="No Resend emails yet"
          description="This person has no linked Resend emails to compute stats from."
          Icon={IconMail}
        />
      </div>
    );
  }

  const deliverabilityRate = stats.deliverabilityRate;
  const deliverabilityDenominator =
    stats.groupCounts.reached + stats.groupCounts.failed;
  const rateColor = isDefined(deliverabilityRate)
    ? getDeliverabilityColor(deliverabilityRate)
    : 'gray';
  const rateLabel = isDefined(deliverabilityRate)
    ? formatRate(deliverabilityRate)
    : 'N/A';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.h2TitleNoMargin}>
            <H2Title title="Deliverability rate" />
          </div>
          <StatusPill color={rateColor} text={rateLabel} />
        </div>
        <MiniProgressBar
          value={isDefined(deliverabilityRate) ? deliverabilityRate * 100 : 0}
          color={rateColor}
        />
        <div style={styles.rateMeta}>
          {stats.groupCounts.reached} delivered out of{' '}
          {deliverabilityDenominator} concluded ({stats.total} total emails)
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.h2TitleNoMargin}>
          <H2Title title="Status breakdown" />
        </div>
        <div style={styles.legend}>
          {RESEND_EMAIL_STATUS_DISPLAY_ORDER.map((status) => {
            const count = stats.countsByStatus[status];

            if (count === 0) return null;

            const meta = EMAIL_STATUS_META_BY_STATUS[status];
            const percentage = (count / stats.total) * 100;

            return (
              <div key={status} style={styles.statusRow}>
                <StatusPill color={meta.color} text={meta.label} />
                <MiniProgressBar value={percentage} color={meta.color} />
                <span style={styles.statusCount}>
                  {count} ({formatPercentage(count, stats.total)})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    PERSON_RESEND_EMAIL_STATS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Person Resend Email Stats',
  description:
    "Shows the breakdown of a person's linked Resend emails by last event and computes the deliverability rate.",
  component: PersonResendEmailStats,
});
