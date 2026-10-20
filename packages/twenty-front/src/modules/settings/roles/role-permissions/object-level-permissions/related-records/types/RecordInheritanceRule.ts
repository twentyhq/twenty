export type RecordInheritanceRule = {
  id: string;
  objectMetadataId: string;
  parentObjectMetadataId: string;
  fieldMetadataId: string;
  junctionFieldMetadataId?: string | null;
};
