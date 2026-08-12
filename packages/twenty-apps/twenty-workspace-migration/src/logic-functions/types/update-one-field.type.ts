import { FieldsListType } from "src/logic-functions/types/find-objects-fields.type";

export type UpdateOneFieldType = Omit<FieldsListType,
  'applicationId'
  | 'id'
  | 'morphId'
  | 'morphRelations'
  | 'objectMetadataId'
  | 'relation'
  | 'type'
  | 'universalIdentifier'>;