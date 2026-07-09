import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import {
  ANALYZE_MIGRATION_ROUTE_PATH,
  CONTROL_MIGRATION_ROUTE_PATH,
  TEST_CONNECTION_ROUTE_PATH,
} from 'src/constants/route-paths';
import { MIGRATION_WIZARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const POLL_INTERVAL_MS = 3_000;

const OBJECT_CHOICES = [
  { key: 'account', label: 'Accounts → Companies' },
  { key: 'contact', label: 'Contacts → People' },
  { key: 'lead', label: 'Leads → People (unconverted only)' },
  { key: 'opportunity', label: 'Opportunities → Opportunities' },
  { key: 'task', label: 'Tasks → Tasks' },
  { key: 'note', label: 'Notes → Notes (classic notes)' },
];

type ConnectionInfo = {
  success: boolean;
  orgName?: string;
  orgId?: string;
  currencyIsoCode?: string;
  apiVersion?: string;
  error?: string;
};

type PlanObject = {
  key: string;
  label: string;
  salesforceObject: string;
  targetObject: string;
  recordCount: number;
  fieldMapping: Record<string, string>;
  relationNotes: string[];
};

type Plan = {
  orgName: string;
  totalRecords: number;
  objects: PlanObject[];
  warnings: string[];
};

type Migration = {
  id: string;
  name: string | null;
  status: string;
  totalRecords: number | null;
  processedRecords: number | null;
  createdRecords: number | null;
  updatedRecords: number | null;
  failedRecords: number | null;
  lastError: string | null;
  plan: Plan | null;
};

type MigrationItem = {
  id: string;
  name: string | null;
  status: string;
  recordCount: number | null;
  processedCount: number | null;
  createdCount: number | null;
  updatedCount: number | null;
  failedCount: number | null;
  lastError: string | null;
};

type Phase = 'loading' | 'connect' | 'plan' | 'progress';

const TERMINAL_STATUSES = ['COMPLETED', 'COMPLETED_WITH_ERRORS', 'CANCELLED'];

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--t-spacing-4)',
    padding: 'var(--t-spacing-4)',
    fontFamily: 'var(--t-font-family)',
    fontSize: 'var(--t-font-size-md)',
    color: 'var(--t-font-color-primary)',
  },
  title: {
    fontSize: 'var(--t-font-size-md)',
    fontWeight: 'var(--t-font-weight-semi-bold)' as CSSProperties['fontWeight'],
  },
  subtle: {
    color: 'var(--t-font-color-tertiary)',
    fontSize: 'var(--t-font-size-sm)',
  },
  card: {
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 'var(--t-border-radius-sm)',
    padding: 'var(--t-spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--t-spacing-2)',
    backgroundColor: 'var(--t-background-secondary)',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 'var(--t-spacing-2)',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--t-spacing-2)',
    cursor: 'pointer',
  },
  error: {
    color: 'var(--t-font-color-danger)',
    fontSize: 'var(--t-font-size-sm)',
    whiteSpace: 'pre-wrap',
  },
  buttonRow: {
    display: 'flex',
    gap: 'var(--t-spacing-2)',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: 'var(--t-spacing-2) var(--t-spacing-3)',
    borderRadius: 'var(--t-border-radius-sm)',
    border: '1px solid var(--t-border-color-medium)',
    backgroundColor: 'var(--t-color-blue)',
    color: 'var(--t-font-color-inverted)',
    cursor: 'pointer',
    fontSize: 'var(--t-font-size-sm)',
    fontWeight: 'var(--t-font-weight-medium)' as CSSProperties['fontWeight'],
  },
  secondaryButton: {
    padding: 'var(--t-spacing-2) var(--t-spacing-3)',
    borderRadius: 'var(--t-border-radius-sm)',
    border: '1px solid var(--t-border-color-medium)',
    backgroundColor: 'var(--t-background-primary)',
    color: 'var(--t-font-color-primary)',
    cursor: 'pointer',
    fontSize: 'var(--t-font-size-sm)',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--t-border-color-light)',
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--t-color-blue)',
    transition: 'width 0.5s ease',
  },
  statusBadge: {
    padding: '2px var(--t-spacing-2)',
    borderRadius: 'var(--t-border-radius-sm)',
    border: '1px solid var(--t-border-color-medium)',
    fontSize: 'var(--t-font-size-xs)',
    whiteSpace: 'nowrap',
  },
  mono: {
    fontSize: 'var(--t-font-size-xs)',
    color: 'var(--t-font-color-secondary)',
  },
};

const formatCount = (value: number | null | undefined): string =>
  (value ?? 0).toLocaleString('en-US');

const resolveFunctionsClient = (): { client: RestApiClient; prefix: string } => {
  const functionsBaseUrl = process.env.TWENTY_FUNCTIONS_URL;

  if (typeof functionsBaseUrl === 'string' && functionsBaseUrl.length > 0) {
    return { client: new RestApiClient({ baseUrl: functionsBaseUrl }), prefix: '' };
  }

  // Legacy self-hosted servers still serve app routes under /s.
  return { client: new RestApiClient(), prefix: '/s' };
};

const callAppRoute = async <TResponse,>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const { client, prefix } = resolveFunctionsClient();

  return await client.post<TResponse>(`${prefix}${path}`, body);
};

const restClient = new RestApiClient();

const fetchLatestMigration = async (): Promise<Migration | null> => {
  const response = await restClient.get<{
    data?: { salesforceMigrations?: Migration[] };
  }>('/rest/salesforceMigrations', {
    query: { order_by: 'createdAt[DescNullsLast]', limit: 1 },
  });

  return response?.data?.salesforceMigrations?.[0] ?? null;
};

const fetchMigrationById = async (
  migrationId: string,
): Promise<Migration | null> => {
  const response = await restClient.get<{
    data?: { salesforceMigration?: Migration };
  }>(`/rest/salesforceMigrations/${migrationId}`);

  return response?.data?.salesforceMigration ?? null;
};

const fetchMigrationItems = async (
  migrationId: string,
): Promise<MigrationItem[]> => {
  const response = await restClient.get<{
    data?: { salesforceMigrationItems?: MigrationItem[] };
  }>('/rest/salesforceMigrationItems', {
    query: {
      filter: `migrationId[eq]:${migrationId}`,
      order_by: 'processingOrder[AscNullsLast]',
      limit: 50,
    },
  });

  return response?.data?.salesforceMigrationItems ?? [];
};

export const SalesforceMigrationWizard = () => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<string[]>(
    OBJECT_CHOICES.map((choice) => choice.key),
  );
  const [plan, setPlan] = useState<Plan | null>(null);
  const [migration, setMigration] = useState<Migration | null>(null);
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const migrationIdRef = useRef<string | null>(null);

  const testConnection = useCallback(async () => {
    setBusy(true);
    setErrorMessage(null);

    try {
      const result = await callAppRoute<ConnectionInfo>(
        TEST_CONNECTION_ROUTE_PATH,
        {},
      );

      setConnection(result);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Connection failed.');
      }
    } catch (error) {
      setConnection({ success: false });
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }, []);

  const refreshProgress = useCallback(async () => {
    const migrationId = migrationIdRef.current;

    if (migrationId === null) {
      return;
    }

    try {
      const [migrationRecord, itemRecords] = await Promise.all([
        fetchMigrationById(migrationId),
        fetchMigrationItems(migrationId),
      ]);

      if (migrationRecord !== null) {
        setMigration(migrationRecord);
      }
      setItems(itemRecords);
    } catch {
      // Polling failures are transient; keep the last known state.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const latestMigration = await fetchLatestMigration();

        if (cancelled) {
          return;
        }

        if (
          latestMigration !== null &&
          !TERMINAL_STATUSES.includes(latestMigration.status)
        ) {
          migrationIdRef.current = latestMigration.id;
          setMigration(latestMigration);

          if (latestMigration.status === 'READY') {
            setPlan(latestMigration.plan);
            setPhase('plan');
          } else {
            setPhase('progress');
          }

          return;
        }
      } catch {
        // Fall through to the connect step when history cannot be read.
      }

      if (!cancelled) {
        setPhase('connect');
        void testConnection();
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [testConnection]);

  useEffect(() => {
    if (phase !== 'progress') {
      return;
    }

    void refreshProgress();
    const interval = setInterval(() => void refreshProgress(), POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [phase, refreshProgress]);

  const analyze = async () => {
    setBusy(true);
    setErrorMessage(null);

    try {
      const result = await callAppRoute<{
        success: boolean;
        migrationId?: string;
        plan?: Plan;
        error?: string;
      }>(ANALYZE_MIGRATION_ROUTE_PATH, { objects: selectedObjects });

      if (!result.success || !result.migrationId || !result.plan) {
        setErrorMessage(result.error ?? 'Analysis failed.');

        return;
      }

      migrationIdRef.current = result.migrationId;
      setPlan(result.plan);
      setPhase('plan');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const control = async (action: 'start' | 'pause' | 'resume' | 'cancel') => {
    const migrationId = migrationIdRef.current;

    if (migrationId === null) {
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      const result = await callAppRoute<{
        success: boolean;
        status?: string;
        error?: string;
      }>(CONTROL_MIGRATION_ROUTE_PATH, { migrationId, action });

      if (!result.success) {
        setErrorMessage(result.error ?? `Could not ${action} the migration.`);

        return;
      }

      if (action === 'cancel' && phase === 'plan') {
        migrationIdRef.current = null;
        setPlan(null);
        setPhase('connect');
        void testConnection();

        return;
      }

      await enqueueSnackbar({
        message: `Migration ${result.status?.toLowerCase() ?? action}`,
        variant: 'success',
      });
      setPhase('progress');
      void refreshProgress();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };

  const startNewMigration = () => {
    migrationIdRef.current = null;
    setMigration(null);
    setItems([]);
    setPlan(null);
    setErrorMessage(null);
    setPhase('connect');
    void testConnection();
  };

  const toggleObject = (key: string) => {
    setSelectedObjects((previous) =>
      previous.includes(key)
        ? previous.filter((selectedKey) => selectedKey !== key)
        : [...previous, key],
    );
  };

  if (phase === 'loading') {
    return <div style={styles.container}>Loading…</div>;
  }

  if (phase === 'connect') {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Migrate from Salesforce</div>
        <div style={styles.card}>
          <div style={styles.title}>1. Connection</div>
          {connection?.success === true ? (
            <div>
              Connected to <strong>{connection.orgName}</strong>
              <div style={styles.mono}>
                Org {connection.orgId} · API v{connection.apiVersion} · Currency{' '}
                {connection.currencyIsoCode}
              </div>
            </div>
          ) : (
            <div style={styles.subtle}>
              {busy
                ? 'Testing the Salesforce connection…'
                : 'Not connected yet. Connect Salesforce from the application settings (Connections tab), then retest.'}
            </div>
          )}
          <div style={styles.buttonRow}>
            <button
              style={{ ...styles.secondaryButton, ...(busy ? styles.disabledButton : {}) }}
              onClick={() => void testConnection()}
              disabled={busy}
            >
              Retest connection
            </button>
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.title}>2. What to migrate</div>
          {OBJECT_CHOICES.map((choice) => (
            <label key={choice.key} style={styles.label}>
              <input
                type="checkbox"
                checked={selectedObjects.includes(choice.key)}
                onChange={() => toggleObject(choice.key)}
              />
              {choice.label}
            </label>
          ))}
        </div>
        {errorMessage !== null && <div style={styles.error}>{errorMessage}</div>}
        <div style={styles.buttonRow}>
          <button
            style={{
              ...styles.primaryButton,
              ...(busy || connection?.success !== true || selectedObjects.length === 0
                ? styles.disabledButton
                : {}),
            }}
            onClick={() => void analyze()}
            disabled={busy || connection?.success !== true || selectedObjects.length === 0}
          >
            {busy ? 'Analyzing…' : 'Analyze Salesforce data'}
          </button>
        </div>
        <div style={styles.subtle}>
          Analysis only reads from Salesforce. Nothing is written to Twenty until
          you review the plan and start the migration.
        </div>
      </div>
    );
  }

  if (phase === 'plan' && plan !== null) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Migration plan · {plan.orgName}</div>
        <div style={styles.subtle}>
          {formatCount(plan.totalRecords)} records will be migrated. Records
          already migrated are updated, not duplicated.
        </div>
        {plan.objects.map((planObject) => (
          <div key={planObject.key} style={styles.card}>
            <div style={styles.row}>
              <strong>{planObject.label}</strong>
              <span>{formatCount(planObject.recordCount)} records</span>
            </div>
            <div style={styles.mono}>
              {Object.entries(planObject.fieldMapping)
                .map(([source, target]) => `${source} → ${target}`)
                .join(' · ')}
            </div>
            {planObject.relationNotes.map((note) => (
              <div key={note} style={styles.subtle}>
                ↳ {note}
              </div>
            ))}
          </div>
        ))}
        {plan.warnings.map((warning) => (
          <div key={warning} style={styles.error}>
            {warning}
          </div>
        ))}
        {errorMessage !== null && <div style={styles.error}>{errorMessage}</div>}
        <div style={styles.buttonRow}>
          <button
            style={{ ...styles.primaryButton, ...(busy ? styles.disabledButton : {}) }}
            onClick={() => void control('start')}
            disabled={busy}
          >
            {busy ? 'Starting…' : 'Start migration'}
          </button>
          <button
            style={{ ...styles.secondaryButton, ...(busy ? styles.disabledButton : {}) }}
            onClick={() => void control('cancel')}
            disabled={busy}
          >
            Discard plan
          </button>
        </div>
      </div>
    );
  }

  const status = migration?.status ?? 'RUNNING';
  const processed = migration?.processedRecords ?? 0;
  const total = migration?.totalRecords ?? 0;
  const overallProgress = total > 0 ? Math.min((processed / total) * 100, 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <div style={styles.title}>{migration?.name ?? 'Salesforce migration'}</div>
        <span style={styles.statusBadge}>{status.replace(/_/g, ' ')}</span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${overallProgress}%` }} />
      </div>
      <div style={styles.subtle}>
        {formatCount(processed)} / {formatCount(total)} processed ·{' '}
        {formatCount(migration?.createdRecords)} created ·{' '}
        {formatCount(migration?.updatedRecords)} updated ·{' '}
        {formatCount(migration?.failedRecords)} failed
      </div>
      {items.map((item) => {
        const itemTotal = item.recordCount ?? 0;
        const itemProcessed = item.processedCount ?? 0;
        const itemProgress =
          itemTotal > 0 ? Math.min((itemProcessed / itemTotal) * 100, 100) : 0;

        return (
          <div key={item.id} style={styles.card}>
            <div style={styles.row}>
              <strong>{item.name}</strong>
              <span style={styles.statusBadge}>
                {item.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${itemProgress}%` }} />
            </div>
            <div style={styles.mono}>
              {formatCount(itemProcessed)} / {formatCount(itemTotal)} ·{' '}
              {formatCount(item.createdCount)} created ·{' '}
              {formatCount(item.updatedCount)} updated ·{' '}
              {formatCount(item.failedCount)} failed
            </div>
            {item.lastError !== null && (
              <div style={styles.error}>{item.lastError}</div>
            )}
          </div>
        );
      })}
      {migration?.lastError != null && (
        <div style={styles.error}>{migration.lastError}</div>
      )}
      {errorMessage !== null && <div style={styles.error}>{errorMessage}</div>}
      <div style={styles.buttonRow}>
        {status === 'RUNNING' && (
          <button
            style={{ ...styles.secondaryButton, ...(busy ? styles.disabledButton : {}) }}
            onClick={() => void control('pause')}
            disabled={busy}
          >
            Pause
          </button>
        )}
        {(status === 'PAUSED' || status === 'FAILED') && (
          <button
            style={{ ...styles.primaryButton, ...(busy ? styles.disabledButton : {}) }}
            onClick={() => void control('resume')}
            disabled={busy}
          >
            Resume
          </button>
        )}
        {!TERMINAL_STATUSES.includes(status) && (
          <button
            style={{ ...styles.secondaryButton, ...(busy ? styles.disabledButton : {}) }}
            onClick={() => void control('cancel')}
            disabled={busy}
          >
            Cancel
          </button>
        )}
        {TERMINAL_STATUSES.includes(status) && (
          <button style={styles.primaryButton} onClick={startNewMigration}>
            Plan a new migration
          </button>
        )}
      </div>
      {(migration?.failedRecords ?? 0) > 0 && (
        <div style={styles.subtle}>
          Failed records are listed in the Salesforce Migration Errors object
          with the original Salesforce data for inspection.
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MIGRATION_WIZARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'salesforce-migration-wizard',
  description:
    'Wizard to plan, review, start, and monitor a Salesforce to Twenty migration.',
  component: SalesforceMigrationWizard,
});
