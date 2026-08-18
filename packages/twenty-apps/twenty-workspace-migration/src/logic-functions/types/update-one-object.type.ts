import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

export type UpdateOneObjectType = {
  id: string, object: Omit<ObjectType,
    'applicationId'
    | 'fieldsList'
    | 'id'
    | 'isSystem'
    | 'universalIdentifier'>
};