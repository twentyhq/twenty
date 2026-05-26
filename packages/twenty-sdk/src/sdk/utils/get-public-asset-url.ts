import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';
import { buildPublicAssetUrl } from 'twenty-shared/utils';

const decodeTokenPayload = (
  token: string,
): { workspaceId: string; applicationId: string } => {
  const payload = JSON.parse(atob(token.split('.')[1]));

  return {
    workspaceId: payload.workspaceId,
    applicationId: payload.applicationId,
  };
};

// Returns the public URL for a file in the app's public/ directory.
// Works in both logic functions and front components.
// The path is relative to the public/ folder (e.g. "images/logo.png").
export const getPublicAssetUrl = (path: string): string => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const token = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !token) {
    throw new Error(
      'getPublicAssetUrl can only be called from within a logic function or front component',
    );
  }

  const { workspaceId, applicationId } = decodeTokenPayload(token);
  const withoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path;
  const withPublicPrefix = withoutLeadingSlash.startsWith('public/')
    ? withoutLeadingSlash
    : `public/${withoutLeadingSlash}`;

  const isAbsolute =
    withPublicPrefix.startsWith('http://') ||
    withPublicPrefix.startsWith('https://');

  const encodedPath = isAbsolute
    ? withPublicPrefix
    : withPublicPrefix.split('/').map(encodeURIComponent).join('/');

  const url = buildPublicAssetUrl({
    path: encodedPath,
    serverUrl: apiUrl,
    workspaceId,
    applicationId,
  });

  if (!url) {
    throw new Error('Failed to build public asset URL');
  }

  return url;
};
