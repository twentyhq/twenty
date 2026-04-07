export const isPathNavigationPayload = (
  payload: Record<string, unknown>,
): payload is { path: string } =>
  'path' in payload && typeof payload.path === 'string';
