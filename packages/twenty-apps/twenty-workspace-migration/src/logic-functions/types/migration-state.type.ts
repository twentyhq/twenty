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
}
