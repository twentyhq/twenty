export type WorkflowAiAgentCrudObjectPermission = {
  objectMetadataId: string;
  canReadObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  canSoftDeleteObjectRecords: boolean;
  canDestroyObjectRecords: boolean;
};
