import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
  Attachment = 'attachment',
  PersonPicture = 'person-picture',
  ServerlessFunction = 'serverless-function',
}

registerEnumType(FileFolder, {
  name: 'FileFolder',
});

export type FileFolderConfig = {
  isPublic: boolean;
};

export const fileFolderConfigs: Record<FileFolder, FileFolderConfig> = {
  [FileFolder.ProfilePicture]: {
    isPublic: true,
  },
  [FileFolder.WorkspaceLogo]: {
    isPublic: true,
  },
  [FileFolder.Attachment]: {
    isPublic: false,
  },
  [FileFolder.PersonPicture]: {
    isPublic: true,
  },
  [FileFolder.ServerlessFunction]: {
    isPublic: false,
  },
};
