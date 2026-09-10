export type ChatReferenceIdentity =
  | { kind: 'record'; objectNameSingular: string; recordId: string }
  | { kind: 'records'; objectMetadataId: string }
  | { kind: 'object'; objectNameSingular: string }
  | { kind: 'field'; objectNameSingular: string; fieldName: string }
  | { kind: 'view'; viewId: string }
  | { kind: 'role'; roleId: string }
  | { kind: 'app'; applicationId: string };
