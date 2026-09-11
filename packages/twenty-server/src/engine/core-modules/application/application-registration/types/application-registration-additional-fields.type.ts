import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type ApplicationRegistrationAdditionalFields = Partial<
  Pick<
    ApplicationRegistrationEntity,
    | 'name'
    | 'sourcePackage'
    | 'tarballFileId'
    | 'isListed'
    | 'isVetted'
    | 'ownerWorkspaceId'
  >
>;
