export const AVATAR_IMAGE_FIXTURE = {
  requestPath: '/__twenty-ui-avatar-image__/',
  firstSource:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="royalblue"/%3E%3C/svg%3E',
  replacementSource:
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Ccircle cx="32" cy="32" r="32" fill="seagreen"/%3E%3C/svg%3E',
  sourceSetSource:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSJwdXJwbGUiLz48L3N2Zz4=',
  brokenSource: 'data:image/png;base64,invalid',
  pendingImage:
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="tomato"/></svg>',
} as const;
