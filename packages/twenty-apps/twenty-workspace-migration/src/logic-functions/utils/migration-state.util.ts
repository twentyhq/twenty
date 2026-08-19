import { kv } from 'twenty-sdk/logic-function';
import { MigrationState } from "src/logic-functions/types/migration-state.type";
import { logger } from "src/logic-functions/utils/logger.util";
import { triggerWorkspaceMigration } from "src/logic-functions/utils/trigger-workspace-migration.util";

const MIGRATION_STATE_KV_KEY = 'migrationState';

const createInitialMigrationState = (): MigrationState => ({
  stage: 1,
  maxRequests: 0,
  sourceWorkspaceObjects: [],
  targetWorkspaceObjects: [],
  objectsToUpdate: [],
  fieldsToCreate: [],
  fieldsToUpdate: [],
  recordIdMap: new Map(),
  targetObjectIdBySourceObjectId: new Map(),
  targetFieldIdBySourceFieldId: new Map(),
  objectRecordsToMigrate: new Map(),
  recordMigrationOrder: [],
});

export const migrationState: MigrationState = createInitialMigrationState();

export const setStateRef = <K extends keyof MigrationState>(key: K, value: MigrationState[K]): void => {
  migrationState[key] = value;
};

const serializeMigrationState = () => ({
  ...migrationState,
  recordIdMap: Object.fromEntries(migrationState.recordIdMap),
  targetObjectIdBySourceObjectId: Object.fromEntries(migrationState.targetObjectIdBySourceObjectId),
  targetFieldIdBySourceFieldId: Object.fromEntries(migrationState.targetFieldIdBySourceFieldId),
  objectRecordsToMigrate: Object.fromEntries(migrationState.objectRecordsToMigrate),
});

type SerializedMigrationState = Omit<
  MigrationState,
  'recordIdMap' | 'targetObjectIdBySourceObjectId' | 'targetFieldIdBySourceFieldId' | 'objectRecordsToMigrate'
> & {
  recordIdMap: Record<string, string>;
  targetObjectIdBySourceObjectId: Record<string, string>;
  targetFieldIdBySourceFieldId: Record<string, string>;
  objectRecordsToMigrate: Record<string, string>;
};

export const saveMigrationStateCheckpoint = async (): Promise<void> => {
  try {
    await kv.set(MIGRATION_STATE_KV_KEY, serializeMigrationState());
    await triggerWorkspaceMigration();
  } catch (error) {
    logger.warn(`Failed to save migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const loadMigrationStateCheckpoint = async (): Promise<void> => {
  try {
    const saved = await kv.get<SerializedMigrationState>(MIGRATION_STATE_KV_KEY);
    if (saved === null) {
      return;
    }
    migrationState.stage = saved.stage;
    migrationState.maxRequests = saved.maxRequests;
    migrationState.targetWorkspaceObjects = saved.targetWorkspaceObjects;
    migrationState.objectsToUpdate = saved.objectsToUpdate;
    migrationState.fieldsToCreate = saved.fieldsToCreate;
    migrationState.fieldsToUpdate = saved.fieldsToUpdate;
    migrationState.recordIdMap = new Map(Object.entries(saved.recordIdMap));
    migrationState.targetObjectIdBySourceObjectId = new Map(Object.entries(saved.targetObjectIdBySourceObjectId));
    migrationState.targetFieldIdBySourceFieldId = new Map(Object.entries(saved.targetFieldIdBySourceFieldId));
    migrationState.objectRecordsToMigrate = new Map(Object.entries(saved.objectRecordsToMigrate));
  } catch (error) {
    logger.warn(`Failed to load migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
};
