import { UpdateOneFieldType } from "src/logic-functions/types/update-one-field.type";
import { CreateOneFieldType } from "src/logic-functions/types/create-one-field.type";
import { UpdateOneObjectType } from "src/logic-functions/types/update-one-object.type";
import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

export type MigrationState = {
  stage: number;
  maxRequests: number;
  sourceWorkspaceObjects: ObjectType[];
  targetWorkspaceObjects: { nameSingular: string, id: string, universalIdentifier: string }[];
  objectsToUpdate: UpdateOneObjectType[];
  fieldsToCreate: CreateOneFieldType[];
  fieldsToUpdate: UpdateOneFieldType[];
  workspaceMemberIdMap: Map<string, string>; // <sourceMemberId, targetMemberId>
  migratedRecordIds: Set<string>;
  recordMigrationOrder: ObjectType[];
  targetObjectIdBySourceObjectId: Map<string, string>;
  targetFieldIdBySourceFieldId: Map<string, string>;
  objectRecordsToMigrate: Map<string, string>; //<namePlural, after cursor>
  // How far the post-record-migration relation reconciliation has got through the record
  // migration order, so a resumed run doesn't re-scan objects it already reconciled.
  reconciliationObjectIndex: number;
  targetPageLayoutIdBySourcePageLayoutId: Map<string, string>;
  attachmentTargetFieldNameByObjectName: Map<string, string>;
  targetAttachmentFileFieldId: string | null;
  migratedNavigationMenuItems: boolean,
  migratedSkills: boolean,
  migratedWebhooks: boolean,
  migratedRoles: boolean,
}
