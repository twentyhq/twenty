import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type TwentyStandardApplicationUniversalIdentifiers } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

export type StandardApplicationEntityByApplicationUniversalIdentifier = Record<
  TwentyStandardApplicationUniversalIdentifiers,
  ApplicationEntity
>;
