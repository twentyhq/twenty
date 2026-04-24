import { type ReactNode } from 'react';

import { THEME } from 'src/modules/github/contributor/components/theme';

export type LeaderboardEntry = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
  count: number;
};

const ROW_HEIGHT = 32;
const CELL_PADDING_X = 8;
const RANK_COL_WIDTH = 36;
const COUNT_COL_WIDTH = 72;

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    minHeight: 0,
    fontFamily: THEME.fontFamily,
    color: THEME.fontPrimary,
    background: THEME.bgPrimary,
    boxSizing: 'border-box',
    overflow: 'hidden',
  } as const,
  table: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    width: '100%',
  } as const,
  headerRow: {
    display: 'flex',
    alignItems: 'stretch',
    height: ROW_HEIGHT,
    flexShrink: 0,
    borderBottom: `1px solid ${THEME.borderLight}`,
    background: THEME.bgPrimary,
  } as const,
  headerCell: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: `0 ${CELL_PADDING_X}px`,
    borderRight: `1px solid ${THEME.borderLight}`,
    color: THEME.fontTertiary,
    fontSize: 12,
    fontWeight: 500,
    boxSizing: 'border-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  } as const,
  headerCellLast: {
    borderRight: 'none',
  } as const,
  row: {
    display: 'flex',
    alignItems: 'stretch',
    height: ROW_HEIGHT,
    flexShrink: 0,
    width: '100%',
    background: THEME.bgPrimary,
    color: THEME.fontPrimary,
    textDecoration: 'none',
    boxSizing: 'border-box',
  } as const,
  cell: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: `0 ${CELL_PADDING_X}px`,
    borderBottom: `1px solid ${THEME.borderLight}`,
    borderRight: `1px solid ${THEME.borderLight}`,
    fontSize: 13,
    boxSizing: 'border-box',
    minWidth: 0,
    overflow: 'hidden',
    transition: 'background-color 80ms ease',
  } as const,
  cellLast: {
    borderRight: 'none',
  } as const,
  rankCell: {
    width: RANK_COL_WIDTH,
    flexShrink: 0,
    justifyContent: 'flex-end',
    color: THEME.fontTertiary,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
  } as const,
  contributorCell: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  } as const,
  countCell: {
    width: COUNT_COL_WIDTH,
    flexShrink: 0,
    justifyContent: 'flex-end',
    color: THEME.fontSecondary,
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 500,
  } as const,
  avatar: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    objectFit: 'cover',
    background: THEME.bgTertiary,
    flexShrink: 0,
  } as const,
  nameWrapper: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    minWidth: 0,
    flex: 1,
    lineHeight: 1.2,
  } as const,
  name: {
    fontSize: 13,
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
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: THEME.fontTertiary,
    fontSize: 13,
    padding: 16,
    textAlign: 'center',
  } as const,
};

type LeaderboardProps = {
  contributorColumnLabel: string;
  countColumnLabel: string;
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
};

const renderState = (content: ReactNode) => (
  <div style={styles.empty}>{content}</div>
);

const Row = ({
  rank,
  entry,
  countLabel,
}: {
  rank: number;
  entry: LeaderboardEntry;
  countLabel: string;
}) => {
  const label = entry.name ?? entry.ghLogin ?? 'Unknown';
  const profileHref = entry.ghLogin
    ? `https://github.com/${entry.ghLogin}`
    : undefined;

  const onEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = THEME.bgSecondary;
  };
  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.backgroundColor = THEME.bgPrimary;
  };

  const cells = (
    <>
      <div style={{ ...styles.cell, ...styles.rankCell }}>{rank}</div>
      <div style={{ ...styles.cell, ...styles.contributorCell }}>
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" style={styles.avatar} />
        ) : (
          <div style={styles.avatar} />
        )}
        <div style={styles.nameWrapper}>
          <span style={styles.name}>{label}</span>
          {entry.ghLogin && entry.ghLogin !== label && (
            <span style={styles.login}>@{entry.ghLogin}</span>
          )}
        </div>
      </div>
      <div
        style={{ ...styles.cell, ...styles.countCell, ...styles.cellLast }}
        title={countLabel}
      >
        {entry.count}
      </div>
    </>
  );

  if (profileHref) {
    return (
      <a
        href={profileHref}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...styles.row, cursor: 'pointer' }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {cells}
      </a>
    );
  }

  return (
    <div style={styles.row} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {cells}
    </div>
  );
};

export const Leaderboard = ({
  contributorColumnLabel,
  countColumnLabel,
  entries,
  loading,
  error,
  emptyMessage = 'No activity in the last 90 days',
}: LeaderboardProps) => (
  <div style={styles.root}>
    <div style={styles.headerRow}>
      <div style={{ ...styles.headerCell, ...styles.rankCell }}>#</div>
      <div style={{ ...styles.headerCell, ...styles.contributorCell }}>
        {contributorColumnLabel}
      </div>
      <div
        style={{
          ...styles.headerCell,
          ...styles.countCell,
          ...styles.headerCellLast,
        }}
      >
        {countColumnLabel}
      </div>
    </div>
    {error ? (
      renderState(error)
    ) : loading && entries.length === 0 ? (
      renderState('Loading...')
    ) : entries.length === 0 ? (
      renderState(emptyMessage)
    ) : (
      <div style={styles.table}>
        {entries.map((entry, i) => (
          <Row
            key={entry.id}
            rank={i + 1}
            entry={entry}
            countLabel={countColumnLabel}
          />
        ))}
      </div>
    )}
  </div>
);
