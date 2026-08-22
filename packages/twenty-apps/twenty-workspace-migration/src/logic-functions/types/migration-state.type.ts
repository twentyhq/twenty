import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { CreateOneFieldType } from "src/logic-functions/types/create-one-field.type";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

export type MigrationState = {
  stage: number;
  maxRequests: number;
  sourceWorkspaceObjects: { id: string; nameSingular: string }[];
  targetWorkspaceObjects: { nameSingular: string, id: string, universalIdentifier: string }[];
  objectsToUpdate: UpdateOneObjectType[];
  fieldsToCreate: CreateOneFieldType[];
  fieldsToUpdate: UpdateOneFieldType[];
  recordIdMap: Map<string, string>; // <oldId, newId>
  recordMigrationOrder: ObjectType[];
  targetObjectIdBySourceObjectId: Map<string, string>;
  targetFieldIdBySourceFieldId: Map<string, string>;
  objectRecordsToMigrate: Map<string, string>; //<namePlural, after cursor>
  targetPageLayoutIdBySourcePageLayoutId: Map<string, string>;
  // Computed once in stage2 from the same FindAllObjectsAndFields data it already fetches for
  // both workspaces, instead of migrateAttachments re-fetching it for itself right before
  // Stage 8 runs. <objectNameSingular, source attachment object's "target<Object>" field name>.
  attachmentTargetFieldNameByObjectName: Map<string, string>;
  targetAttachmentFileFieldId: string | null;
  migratedViews: boolean,
  migratedNavigationMenuItems: boolean,
  migratedSkills: boolean,
  migratedWebhooks: boolean,
  migratedRoles: boolean,
  migratedDashboards: boolean,
  migratedRecordPageLayouts: boolean,
}
