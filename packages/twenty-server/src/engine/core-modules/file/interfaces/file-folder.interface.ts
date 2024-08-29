import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
  Attachment = 'attachment',
  PersonPicture = 'person-picture',
  ServerlessFunction = 'serverless-function',
  ServerlessFunctionLayers = 'serverless-function-layers',
  Shared = 'shared',
}

registerEnumType(FileFolder, {
  name: 'FileFolder',
});
