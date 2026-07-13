import { registerEnumType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

registerEnumType(FileFolder, {
  name: 'FileFolder',
});

export type FileFolderConfig = {
  ignoreExpirationToken: boolean;
  cacheControl: string | null;
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
  },
  [FileFolder.AgentChat]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
  },
  [FileFolder.BuiltLogicFunction]: {
    ignoreExpirationToken: false,
    cacheControl: null,
  },
  [FileFolder.BuiltFrontComponent]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
  },
  [FileFolder.PublicAsset]: {
    ignoreExpirationToken: true,
    cacheControl: PUBLIC_ASSET_CACHE_CONTROL,
  },
  [FileFolder.Source]: {
    ignoreExpirationToken: false,
    cacheControl: null,
  },
  [FileFolder.FilesField]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
  },
  [FileFolder.Dependencies]: {
    ignoreExpirationToken: false,
    cacheControl: null,
  },
  [FileFolder.Workflow]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
  },
  [FileFolder.EmailAttachment]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
  },
  [FileFolder.AppTarball]: {
    ignoreExpirationToken: false,
    cacheControl: null,
  },
  [FileFolder.GeneratedSdkClient]: {
    ignoreExpirationToken: false,
    cacheControl: null,
  },
  [FileFolder.Dpa]: {
    ignoreExpirationToken: false,
    cacheControl: IMMUTABLE_FILE_CACHE_CONTROL,
  },
};
