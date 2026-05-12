import { isDefined } from '@utils/is-defined';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  Callout,
  H2Title,
  IconAlertCircle,
  IconRefresh,
  Status,
  themeCssVariables,
} from 'twenty-sdk/ui';

import { extractConnection } from '@modules/resend/shared/utils/typed-client';
import { RESEND_SYNC_CURSOR_STEPS } from '@modules/resend/sync/cursor/constants/resend-sync-cursor-steps';
import type { SyncCursorStep } from '@modules/resend/sync/cursor/types/sync-cursor-step';

type CursorRowStatus = 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';

type CursorRow = {
  id: string;
  step: SyncCursorStep;
  cursor: string | null;
  lastRunAt: string | null;
  lastRunStatus: CursorRowStatus | null;
};

type FetchState = {
  rows: CursorRow[];
  loading: boolean;
  error: string | null;
};

type StatusThemeColor = 'green' | 'red' | 'orange' | 'gray';

const STATUS_COLOR_BY_RUN_STATUS: Record<CursorRowStatus, StatusThemeColor> = {
  SUCCESS: 'green',
  FAILED: 'red',
  IN_PROGRESS: 'orange',
};

const STATUS_LABEL_BY_RUN_STATUS: Record<CursorRowStatus, string> = {
  SUCCESS: 'Success',
  FAILED: 'Failed',
  IN_PROGRESS: 'In progress',
};

const formatTimestamp = (value: string | null): string => {
  if (!isDefined(value)) {
    return '—';
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
};

const formatStepLabel = (step: SyncCursorStep): string =>
  step
    .toLowerCase()
    .split('_')
    .map((part) =>
      part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part,
    )
    .join(' ');

const getStyles = (): Record<string, React.CSSProperties> => ({
  container: {
    fontFamily: themeCssVariables.font.family,
    fontSize: themeCssVariables.font.size.sm,
    color: themeCssVariables.font.color.primary,
    display: 'flex',
    flexDirection: 'column',
    gap: themeCssVariables.spacing[3],
  },
  card: {
    padding: themeCssVariables.spacing[3],
    borderRadius: themeCssVariables.border.radius.md,
    background: themeCssVariables.background.secondary,
    border: `1px solid ${themeCssVariables.border.color.light}`,
    display: 'flex',
    flexDirection: 'column',
    gap: themeCssVariables.spacing[2],
    userSelect: 'text',
    WebkitUserSelect: 'text',
    cursor: 'text',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: themeCssVariables.spacing[2],
  },
  cursorCode: {
    display: 'inline-block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    verticalAlign: 'bottom',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: themeCssVariables.font.size.xs,
    color: themeCssVariables.font.color.secondary,
    background: themeCssVariables.background.transparent.light,
    borderRadius: themeCssVariables.border.radius.sm,
    padding: `0 ${themeCssVariables.spacing[1]}`,
  },
  h2TitleNoMargin: {
    display: 'flex',
    marginBottom: `calc(-1 * ${themeCssVariables.spacing[4]})`,
  },
  cardLine: {
    fontSize: themeCssVariables.font.size.sm,
    color: themeCssVariables.font.color.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: themeCssVariables.spacing[1],
  },
});

export const ResendSyncStatus = () => {
  const [state, setState] = useState<FetchState>({
    rows: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const client = new CoreApiClient();

        const cursorResult = await client.query({
          resendSyncCursors: {
            __args: { first: 50 },
            edges: {
              node: {
                id: true,
                step: true,
                cursor: true,
                lastRunAt: true,
                lastRunStatus: true,
              },
            },
          },
        });

        const connection = extractConnection<CursorRow>(
          cursorResult,
          'resendSyncCursors',
        );

        if (!cancelled) {
          setState({
            rows: connection.edges.map((edge) => edge.node),
            loading: false,
            error: null,
          });
        }
      } catch (fetchError) {
        if (!cancelled) {
          setState({
            rows: [],
            loading: false,
            error:
              fetchError instanceof Error
                ? fetchError.message
                : String(fetchError),
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const styles = getStyles();

  if (state.loading) {
    return (
      <div style={styles.container}>
        <Callout
          variant="neutral"
          title="Loading sync status"
          description="Fetching cursors and queue counts…"
          Icon={IconRefresh}
        />
      </div>
    );
  }

  if (isDefined(state.error)) {
    return (
      <div style={styles.container}>
        <Callout
          variant="error"
          title="Failed to load sync status"
          description={state.error}
          Icon={IconAlertCircle}
        />
      </div>
    );
  }

  const rowByStep = new Map<SyncCursorStep, CursorRow>();

  for (const row of state.rows) {
    rowByStep.set(row.step, row);
  }

  return (
    <div style={styles.container}>
      {RESEND_SYNC_CURSOR_STEPS.map((step) => {
        const row = rowByStep.get(step);
        const runStatus = row?.lastRunStatus ?? null;
        const cursor = row?.cursor ?? null;
        const lastRunAt = row?.lastRunAt ?? null;
        const statusColor: StatusThemeColor = isDefined(runStatus)
          ? STATUS_COLOR_BY_RUN_STATUS[runStatus]
          : 'gray';
        const statusLabel = isDefined(runStatus)
          ? STATUS_LABEL_BY_RUN_STATUS[runStatus]
          : 'Not synced';

        return (
          <div key={step} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.h2TitleNoMargin}>
                <H2Title title={formatStepLabel(step)} />
              </div>
              <Status
                color={statusColor}
                text={statusLabel}
                isLoaderVisible={runStatus === 'IN_PROGRESS'}
              />
            </div>
            <div style={styles.cardLine}>
              Last run: {formatTimestamp(lastRunAt)}
            </div>
            {isDefined(cursor) && cursor !== '' && (
              <div style={styles.cardLine}>
                Resume cursor: <code style={styles.cursorCode}>{cursor}</code>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
