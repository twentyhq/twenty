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
  // An index into buildRecordMigrationOrder(sourceWorkspaceObjects) rather than a sliced copy
  // of it: the order is derivable, and persisting the objects themselves meant every checkpoint
  // re-serialized the whole schema a second time.
  recordMigrationIndex: number;
  targetObjectIdBySourceObjectId: Map<string, string>;
  targetFieldIdBySourceFieldId: Map<string, string>;
  objectRecordsToMigrate: Map<string, string>; //<namePlural, after cursor>
  // How far the post-record-migration relation reconciliation has got through the record
  // migration order, so a resumed run doesn't re-scan objects it already reconciled.
  reconciliationObjectIndex: number;
  // An INDEX view is not recreated in the target - migrateViews points it at the target's own
  // pre-provisioned one, whose id differs - so view references have to be resolved through this
  // rather than copied across verbatim.
  targetViewIdBySourceViewId: Map<string, string>;
  targetPageLayoutIdBySourcePageLayoutId: Map<string, string>;
  attachmentTargetFieldNameByObjectName: Map<string, string>;
  targetAttachmentFileFieldId: string | null;
  migratedNavigationMenuItems: boolean,
  migratedSkills: boolean,
  migratedWebhooks: boolean,
  migratedRoles: boolean,
  estimate: {
    estimatedMinutes: number;
    batchableRecordCount: number;
    otherRecordCount: number;
  } | null;
}
