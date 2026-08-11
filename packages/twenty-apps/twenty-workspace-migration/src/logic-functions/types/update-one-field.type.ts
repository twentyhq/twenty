import { FieldsListType } from "src/logic-functions/types/find-objects-fields.type";

// All fields are optional, mirroring UpdateFieldInput (packages/twenty-server
// .../field-metadata/dtos/update-field.input.ts), which accepts a partial update.
export type UpdateOneFieldType = Partial<Omit<FieldsListType,
  'applicationId'
  | 'id'
  | 'morphId'
  | 'morphRelations'
  | 'objectMetadataId'
  | 'relation'
  | 'type'
  | 'universalIdentifier'>>;