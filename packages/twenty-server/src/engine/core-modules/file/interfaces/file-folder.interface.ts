import { registerEnumType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';
import { type KebabCase } from 'type-fest';

registerEnumType(FileFolder, {
  name: 'FileFolder',
});

export type FileFolderConfig = {
  ignoreExpirationToken: boolean;
  immutable: boolean;
};

export const IMMUTABLE_FILE_CACHE_CONTROL = 'private, max-age=86400, immutable';

export const fileFolderConfigs: Record<FileFolder, FileFolderConfig> = {
  [FileFolder.ProfilePicture]: {
    ignoreExpirationToken: true,
    immutable: false,
  },
  [FileFolder.WorkspaceLogo]: {
    ignoreExpirationToken: true,
    immutable: false,
  },
  [FileFolder.Attachment]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.PersonPicture]: {
    ignoreExpirationToken: false,
    immutable: false,
  },
  [FileFolder.CorePicture]: {
    ignoreExpirationToken: true,
    immutable: true,
  },
  [FileFolder.File]: {
    ignoreExpirationToken: false,
    immutable: false,
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

export type AllowedFolders = KebabCase<keyof typeof FileFolder>;
