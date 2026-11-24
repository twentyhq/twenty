export type BackfillRollupFieldsJobData = {
  workspaceId: string;
  objectMetadataId: string;
  rollupFieldMetadataIds?: string[];
  afterRecordId: string | null;
  deduplicationId?: string;
};
