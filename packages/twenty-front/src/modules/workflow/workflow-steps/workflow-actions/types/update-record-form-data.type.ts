export type UpdateRecordFormData = {
  objectNameSingular: string;
  objectRecordId?: string;
  fieldsToUpdate: string[];
  [field: string]: unknown;
};
