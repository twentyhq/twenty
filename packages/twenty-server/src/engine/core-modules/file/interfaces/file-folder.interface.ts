import { registerEnumType } from '@nestjs/graphql';

import { type KebabCase } from 'type-fest';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
  Attachment = 'attachment',
  PersonPicture = 'person-picture',
  ServerlessFunction = 'serverless-function',
  ServerlessFunctionToDelete = 'serverless-function-to-delete',
  File = 'file',
  AgentChat = 'agent-chat',
}

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
};

export type AllowedFolders = KebabCase<keyof typeof FileFolder>;
