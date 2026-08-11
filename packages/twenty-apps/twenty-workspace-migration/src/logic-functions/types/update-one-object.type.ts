import { ObjectType } from "src/logic-functions/types/find-objects-fields.type";

// All fields are optional, mirroring UpdateObjectPayload (packages/twenty-server
// .../object-metadata/dtos/update-object.input.ts), which accepts a partial update.
export type UpdateOneObjectType = Partial<Omit<ObjectType,
  'applicationId'
  | 'fieldsList'
  | 'id'
  | 'isSystem'
  | 'universalIdentifier'>>;