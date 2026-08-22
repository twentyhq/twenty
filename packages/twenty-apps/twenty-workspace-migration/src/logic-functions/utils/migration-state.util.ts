import { kv } from 'twenty-sdk/logic-function';
import { MigrationState } from "src/logic-functions/types/migration-state.type";
import { logger } from "src/logic-functions/utils/logger.util";
import { triggerWorkspaceMigration } from "src/logic-functions/utils/trigger-workspace-migration.util";

const MIGRATION_STATE_KV_KEY = 'migrationState';

const createInitialMigrationState = (): MigrationState => ({
  stage: 1,
  maxRequests: 50, // assuming lower bound
  sourceWorkspaceObjects: [],
  targetWorkspaceObjects: [],
  objectsToUpdate: [],
  fieldsToCreate: [],
  fieldsToUpdate: [],
  workspaceMemberIdMap: new Map(),
  migratedRecordIds: new Set(),
  targetObjectIdBySourceObjectId: new Map(),
  targetFieldIdBySourceFieldId: new Map(),
  objectRecordsToMigrate: new Map(),
  reconciliationObjectIndex: 0,
  recordMigrationOrder: [],
  targetPageLayoutIdBySourcePageLayoutId: new Map(),
  attachmentTargetFieldNameByObjectName: new Map(),
  targetAttachmentFileFieldId: null,
  migratedNavigationMenuItems: false,
  migratedSkills: false,
  migratedWebhooks: false,
  migratedRoles: false,
});

export const migrationState: MigrationState = createInitialMigrationState();

export const setStateRef = <K extends keyof MigrationState>(key: K, value: MigrationState[K]): void => {
  migrationState[key] = value;
};

const serializeMigrationState = () => ({
  ...migrationState,
  workspaceMemberIdMap: Object.fromEntries(migrationState.workspaceMemberIdMap),
  migratedRecordIds: [...migrationState.migratedRecordIds],
  targetObjectIdBySourceObjectId: Object.fromEntries(migrationState.targetObjectIdBySourceObjectId),
  targetFieldIdBySourceFieldId: Object.fromEntries(migrationState.targetFieldIdBySourceFieldId),
  objectRecordsToMigrate: Object.fromEntries(migrationState.objectRecordsToMigrate),
  targetPageLayoutIdBySourcePageLayoutId: Object.fromEntries(migrationState.targetPageLayoutIdBySourcePageLayoutId),
  attachmentTargetFieldNameByObjectName: Object.fromEntries(migrationState.attachmentTargetFieldNameByObjectName),
});

type SerializedMigrationState = Omit<
  MigrationState,
  'workspaceMemberIdMap' | 'migratedRecordIds' | 'targetObjectIdBySourceObjectId' | 'targetFieldIdBySourceFieldId' | 'objectRecordsToMigrate' | 'targetPageLayoutIdBySourcePageLayoutId' | 'attachmentTargetFieldNameByObjectName'
> & {
  workspaceMemberIdMap: Record<string, string>;
  migratedRecordIds: string[];
  targetObjectIdBySourceObjectId: Record<string, string>;
  targetFieldIdBySourceFieldId: Record<string, string>;
  objectRecordsToMigrate: Record<string, string>;
  targetPageLayoutIdBySourcePageLayoutId: Record<string, string>;
  attachmentTargetFieldNameByObjectName: Record<string, string>;
};

export const saveMigrationStateCheckpointAndStop = async (): Promise<void> => {
  try {
    await kv.set(MIGRATION_STATE_KV_KEY, serializeMigrationState());
    await triggerWorkspaceMigration();
  } catch (error) {
    logger.warn(`Failed to save migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const saveMigrationStateCheckpoint = async (): Promise<void> => {
  try {
    await kv.set(MIGRATION_STATE_KV_KEY, serializeMigrationState());
  }
  catch (error) {
    logger.warn(`Failed to save migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const loadMigrationStateCheckpoint = async (): Promise<void> => {
  try {
    const saved = await kv.get<SerializedMigrationState>(MIGRATION_STATE_KV_KEY);
    if (saved === null) {
      return;
    }
    migrationState.stage = saved.stage;
    migrationState.maxRequests = saved.maxRequests;
    migrationState.sourceWorkspaceObjects = saved.sourceWorkspaceObjects;
    migrationState.targetWorkspaceObjects = saved.targetWorkspaceObjects;
    migrationState.objectsToUpdate = saved.objectsToUpdate;
    migrationState.fieldsToCreate = saved.fieldsToCreate;
    migrationState.fieldsToUpdate = saved.fieldsToUpdate;
    migrationState.recordMigrationOrder = saved.recordMigrationOrder;
    migrationState.workspaceMemberIdMap = new Map(Object.entries(saved.workspaceMemberIdMap));
    migrationState.migratedRecordIds = new Set(saved.migratedRecordIds);
    migrationState.targetObjectIdBySourceObjectId = new Map(Object.entries(saved.targetObjectIdBySourceObjectId));
    migrationState.targetFieldIdBySourceFieldId = new Map(Object.entries(saved.targetFieldIdBySourceFieldId));
    migrationState.objectRecordsToMigrate = new Map(Object.entries(saved.objectRecordsToMigrate));
    migrationState.reconciliationObjectIndex = saved.reconciliationObjectIndex;
    migrationState.targetPageLayoutIdBySourcePageLayoutId = new Map(Object.entries(saved.targetPageLayoutIdBySourcePageLayoutId));
    migrationState.attachmentTargetFieldNameByObjectName = new Map(Object.entries(saved.attachmentTargetFieldNameByObjectName));
    migrationState.targetAttachmentFileFieldId = saved.targetAttachmentFileFieldId;
    migrationState.migratedNavigationMenuItems = saved.migratedNavigationMenuItems;
    migrationState.migratedSkills = saved.migratedSkills;
    migrationState.migratedWebhooks = saved.migratedWebhooks;
    migrationState.migratedRoles = saved.migratedRoles;
  } catch (error) {
    logger.warn(`Failed to load migration state checkpoint: ${error instanceof Error ? error.message : String(error)}`);
  }
};
