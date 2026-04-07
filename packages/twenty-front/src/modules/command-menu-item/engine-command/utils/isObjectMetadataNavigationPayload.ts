export const isObjectMetadataNavigationPayload = (
  payload: Record<string, unknown>,
): payload is { objectMetadataItemId: string } =>
  'objectMetadataItemId' in payload &&
  typeof payload.objectMetadataItemId === 'string';
