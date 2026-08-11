export type ChatReferenceIdentity =
  | { kind: 'record'; objectNameSingular: string; recordId: string }
  | { kind: 'object'; objectNameSingular: string }
  | { kind: 'field'; fieldMetadataItemId: string }
  | { kind: 'view'; viewId: string };
