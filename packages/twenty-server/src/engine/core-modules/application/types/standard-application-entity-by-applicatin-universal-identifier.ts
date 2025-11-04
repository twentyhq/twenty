import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { TWENTY_STANDARD_APPLICATION, TWENTY_WORKFLOW_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-applications';

export type StandardApplicationEntityByApplicationUniversalIdentifier = Record<
  | (typeof TWENTY_STANDARD_APPLICATION)['universalIdentifier']
  | (typeof TWENTY_WORKFLOW_APPLICATION)['universalIdentifier'],
  ApplicationEntity
>;
