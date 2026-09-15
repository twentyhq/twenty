import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

export const isMetadataRestRequest = (request: AuthenticatedRequest): boolean =>
  request.originalUrl.startsWith('/rest/metadata/');
