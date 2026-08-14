import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

export type UpdateOneObjectType = Omit<ObjectType,
  'applicationId'
  | 'fieldsList'
  | 'id'
  | 'isSystem'
  | 'universalIdentifier'>;