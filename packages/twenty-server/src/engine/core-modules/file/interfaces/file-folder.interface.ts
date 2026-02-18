import { registerEnumType } from '@nestjs/graphql';

import { FileFolder } from 'twenty-shared/types';
import { type KebabCase } from 'type-fest';

registerEnumType(FileFolder, {
  name: 'FileFolder',
});

export type FileFolderConfig = {
  ignoreExpirationToken: boolean;
};

export const fileFolderConfigs: Record<FileFolder, FileFolderConfig> = {
  [FileFolder.ProfilePicture]: {
    ignoreExpirationToken: true,
  },
  [FileFolder.WorkspaceLogo]: {
    ignoreExpirationToken: true,
  },
  [FileFolder.Attachment]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.PersonPicture]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.CorePicture]: {
    ignoreExpirationToken: true,
  },
  [FileFolder.File]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.AgentChat]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.BuiltLogicFunction]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.BuiltFrontComponent]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.PublicAsset]: {
    ignoreExpirationToken: true,
  },
  [FileFolder.Source]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.FilesField]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.Dependencies]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.Workflow]: {
    ignoreExpirationToken: false,
  },
};

export type AllowedFolders = KebabCase<keyof typeof FileFolder>;
