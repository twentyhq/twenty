export type BackfillStoredFormulaFieldsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  formulaFieldMetadataIds: string[];
  afterRecordId: string | null;
};
