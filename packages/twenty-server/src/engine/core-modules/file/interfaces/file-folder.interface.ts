import { registerEnumType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';

registerEnumType(FileFolder, {
  name: 'FileFolder',
});

export type FileFolderConfig = {
  ignoreExpirationToken: boolean;
  immutable: boolean;
};

export const IMMUTABLE_FILE_CACHE_CONTROL = 'private, max-age=86400, immutable';

export const fileFolderConfigs: Record<FileFolder, FileFolderConfig> = {
  [FileFolder.CorePicture]: {
    ignoreExpirationToken: true,
    immutable: true,
  },
  [FileFolder.AgentChat]: {
    ignoreExpirationToken: false,
    immutable: true,
  },
  [FileFolder.BuiltLogicFunction]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.BuiltFrontComponent]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.PublicAsset]: {
    ignoreExpirationToken: true,
    immutable: false,
  },
  [FileFolder.Source]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.FilesField]: {
    ignoreExpirationToken: false,
    immutable: true,
  },
  [FileFolder.Dependencies]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.Workflow]: {
    ignoreExpirationToken: false,
    immutable: true,
  },
  [FileFolder.EmailAttachment]: {
    ignoreExpirationToken: false,
    immutable: true,
  },
  [FileFolder.AppTarball]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.GeneratedSdkClient]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.Dpa]: {
    ignoreExpirationToken: false,
    immutable: true,
  },
};
