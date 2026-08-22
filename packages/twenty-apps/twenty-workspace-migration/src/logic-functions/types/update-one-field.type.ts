import { FieldsListType } from "src/logic-functions/types/find-objects-fields.type";

export type UpdateOneFieldType = {
  id: string, field: Omit<FieldsListType,
    'applicationId'
    | 'id'
    | 'morphId'
    | 'morphRelations'
    | 'objectMetadataId'
    | 'relation'
    | 'type'
    | 'universalIdentifier'>
};