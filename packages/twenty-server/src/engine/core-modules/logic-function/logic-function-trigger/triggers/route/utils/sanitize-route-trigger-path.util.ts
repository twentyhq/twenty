export const sanitizeRouteTriggerPath = (requestPath: string): string =>
  requestPath.replace(/^\/s\//, '/');
