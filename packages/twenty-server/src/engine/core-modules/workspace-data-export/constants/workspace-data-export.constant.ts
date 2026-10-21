import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const WORKSPACE_DATA_EXPORT_STEP_JOB_NAME = 'WorkspaceDataExportStepJob';
export const WORKSPACE_DATA_EXPORT_STEP_MAX_RECORDS = 50_000;
export const WORKSPACE_DATA_EXPORT_STEP_MAX_ATTEMPTS = 3;
export const WORKSPACE_DATA_EXPORT_STEP_RETRY_DELAY_MS = 10_000;
export const WORKSPACE_DATA_EXPORT_STALE_AFTER_MS = 15 * 60 * 1000;
export const WORKSPACE_DATA_EXPORT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
export const WORKSPACE_DATA_EXPORT_ABANDONED_AFTER_MS = 12 * 60 * 60 * 1000;
export const WORKSPACE_DATA_EXPORT_CLEANUP_BATCH_SIZE = 200;
export const WORKSPACE_DATA_EXPORT_CLEANUP_CRON_PATTERN = '30 * * * *';
export const WORKSPACE_DATA_EXPORT_ALL_RECORDS_FILTER: ObjectRecordFilter = {
  or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
};
