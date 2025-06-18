import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
  Attachment = 'attachment',
  PersonPicture = 'person-picture',
  ServerlessFunction = 'serverless-function',
  BillingSubscriptionBill = 'billing-subscription-bill',
  ChargeBill = 'charge-bill',
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
  [FileFolder.BillingSubscriptionBill]: {
    // TODO: Maybe we shouldn't ignore expiration token for Inter charges?
    ignoreExpirationToken: true,
  },
  [FileFolder.ChargeBill]: {
    ignoreExpirationToken: true,
  },
};
