import { registerEnumType } from '@nestjs/graphql';

import { EMAIL_IMAGE_MIME_TYPES } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';

registerEnumType(FileFolder, {
  name: 'FileFolder',
});

// Folders that accept arbitrary user content declare this instead of a list.
// Spelling it out keeps a new folder from silently inheriting "accept
// everything" by leaving the field off.
export const ANY_MIME_TYPE = 'any' as const;

export type FileFolderConfig = {
  ignoreExpirationToken: boolean;
  cacheControl: string | null;
  allowedMimeTypes: readonly string[] | typeof ANY_MIME_TYPE;
};

export const IMMUTABLE_FILE_CACHE_CONTROL = 'private, max-age=86400, immutable';

export const PUBLIC_ASSET_CACHE_CONTROL = 'public, max-age=3600';

// Responses embedding a short-lived presigned URL must never be stored:
// a cached copy either 403s once the signature expires or leaks a live
// presigned URL to clients that never authenticated.
export const PRESIGNED_URL_NO_STORE_CACHE_CONTROL = 'private, no-store';

export const fileFolderConfigs: Record<FileFolder, FileFolderConfig> = {
  [FileFolder.CorePicture]: {
    ignoreExpirationToken: true,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.AgentChat]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.BuiltLogicFunction]: {
    ignoreExpirationToken: false,
    cacheControl: null,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.BuiltFrontComponent]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.PublicAsset]: {
    ignoreExpirationToken: true,
    cacheControl: PUBLIC_ASSET_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.Source]: {
    ignoreExpirationToken: false,
    cacheControl: null,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.FilesField]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.Dependencies]: {
    ignoreExpirationToken: false,
    cacheControl: null,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.Workflow]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.EmailAttachment]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.EmailImage]: {
    ignoreExpirationToken: true,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: EMAIL_IMAGE_MIME_TYPES,
  },
  [FileFolder.AppTarball]: {
    ignoreExpirationToken: false,
    cacheControl: null,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.GeneratedSdkClient]: {
    ignoreExpirationToken: false,
    cacheControl: null,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
  [FileFolder.Dpa]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
    allowedMimeTypes: ANY_MIME_TYPE,
  },
};
