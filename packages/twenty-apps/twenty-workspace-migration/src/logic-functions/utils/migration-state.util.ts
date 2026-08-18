import { kv } from 'twenty-sdk/logic-function';
import { MigrationState } from "src/logic-functions/types/migration-state.type";

const MIGRATION_STATE_KV_KEY = 'migrationState';

const createInitialMigrationState = (): MigrationState => ({
  stage: 1,
  maxRequests: 0,
  mergedWorkspaceMembers: [],
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

// The single mutable state instance every stage reads from and writes into. Stages don't
// receive this as a parameter - they import it directly, since each will eventually live in
// its own file and a shared singleton is simpler than threading one object through every stage
// function's signature. Assigning a Map/array field (setStateRef or `migrationState.x = ...`)
// stores a LIVE reference, not a copy, so a checkpoint taken later still reflects whatever a
// stage has mutated into it since.
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
  updatedAt: new Date().toISOString(),
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

// A checkpoint is a nice-to-have for resumability, not core migration correctness - a failure
// here is logged and swallowed rather than allowed to abort the actual migration work.
export const saveMigrationStateCheckpoint = async (): Promise<void> => {
  try {
    await kv.set(MIGRATION_STATE_KV_KEY, serializeMigrationState());
  } catch (error) {
    console.warn(`Failed to save migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Mirror of saveMigrationStateCheckpoint: restores whatever the last checkpoint captured back
// into the live migrationState singleton. A stage that might run as its own invocation - rather
// than continuing straight on from an earlier stage within the same run - calls this first so it
// picks up whatever an earlier stage already computed and persisted, instead of silently working
// off createInitialMigrationState()'s empty defaults. A missing/unreadable checkpoint is treated
// the same as "nothing to resume" rather than a hard failure.
export const loadMigrationStateCheckpoint = async (): Promise<void> => {
  try {
    const saved = await kv.get<SerializedMigrationState>(MIGRATION_STATE_KV_KEY);
    if (saved === null) {
      return;
    }
    migrationState.stage = saved.stage;
    migrationState.maxRequests = saved.maxRequests;
    migrationState.mergedWorkspaceMembers = saved.mergedWorkspaceMembers;
    migrationState.targetWorkspaceObjects = saved.targetWorkspaceObjects;
    migrationState.objectsToUpdate = saved.objectsToUpdate;
    migrationState.fieldsToCreate = saved.fieldsToCreate;
    migrationState.fieldsToUpdate = saved.fieldsToUpdate;
    migrationState.recordIdMap = new Map(Object.entries(saved.recordIdMap));
    migrationState.targetObjectIdBySourceObjectId = new Map(Object.entries(saved.targetObjectIdBySourceObjectId));
    migrationState.targetFieldIdBySourceFieldId = new Map(Object.entries(saved.targetFieldIdBySourceFieldId));
    migrationState.objectRecordsToMigrate = new Map(Object.entries(saved.objectRecordsToMigrate));
  } catch (error) {
    console.warn(`Failed to load migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const setMigrationStage = async (stage: number): Promise<void> => {
  migrationState.stage = stage;
  await saveMigrationStateCheckpoint();
};
