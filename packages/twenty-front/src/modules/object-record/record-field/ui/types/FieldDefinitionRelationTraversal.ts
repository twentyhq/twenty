// Describes a field reached through a many-to-one relation of the record's
// object, e.g. Opportunity › Company › Employees.
export type FieldDefinitionRelationTraversal = {
  relationFieldMetadataId: string;
  relationFieldName: string;
  relationFieldLabel: string;
  relationTargetObjectMetadataId: string;
};
