import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

export type CreateOneObjectType = Omit<ObjectType,
  'applicationId'
  | 'fieldsList'
  | 'id'
  | 'isActive'
  | 'isSystem'
  | 'labelIdentifierFieldMetadataId'
  | 'openRecordIn'
  | 'universalIdentifier'> & { skipNameField: boolean };