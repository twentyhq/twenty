export interface ExternalEventInput {
  event: string;
  recordId: string;
  objectMetadataId?: string;
  properties: Record<string, any>;
}
