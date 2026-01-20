import { registerEnumType } from '@nestjs/graphql';

import { type KebabCase } from 'type-fest';
import { FileFolder } from 'twenty-shared/types';

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
  [FileFolder.ServerlessFunction]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.ServerlessFunctionToDelete]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.File]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.AgentChat]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.Functions]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.FrontComponents]: {
    ignoreExpirationToken: false,
  },
  [FileFolder.Assets]: {
    ignoreExpirationToken: true,
  },
  [FileFolder.SourceCode]: {
    ignoreExpirationToken: false,
  },
};

export type AllowedFolders = KebabCase<keyof typeof FileFolder>;
