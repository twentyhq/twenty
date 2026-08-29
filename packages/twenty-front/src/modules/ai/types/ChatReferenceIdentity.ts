export type ChatReferenceIdentity =
  | { kind: 'record'; objectNameSingular: string; recordId: string }
  | { kind: 'object'; objectNameSingular: string }
  | { kind: 'field'; objectNameSingular: string; fieldName: string }
  | { kind: 'legacyFieldById'; fieldMetadataItemId: string }
  | { kind: 'view'; viewId: string };
