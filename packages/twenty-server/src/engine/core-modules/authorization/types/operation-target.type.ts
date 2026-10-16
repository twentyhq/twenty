import { type ApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/types/application-reach-metadata-name.type';
import { type ApplicationTargetAccess } from 'src/engine/core-modules/authorization/application-reach/types/application-target-access.type';

// The entity an operation acts on, checked against the caller's application reach
export type OperationTarget = {
  metadataName: ApplicationReachMetadataName;
  id: string;
  access: ApplicationTargetAccess;
  // Out of reach reads as missing, so another application's ids stay hidden
  createOutOfReachException: (id: string) => Error;
};
