import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

// Mirrors CreateObjectInput (packages/twenty-server .../object-metadata/dtos/create-object.input.ts):
// labelIdentifierFieldMetadataId is deliberately excluded, since it can only reference a field
// that doesn't exist yet at object-creation time (it's set afterwards via updateOneObject).
export type CreateOneObjectType = Omit<ObjectType,
  'applicationId'
  | 'fieldsList'
  | 'id'
  | 'isActive'
  | 'isSystem'
  | 'labelIdentifierFieldMetadataId'
  | 'openRecordIn'
  | 'universalIdentifier'> & { skipNameField: boolean };