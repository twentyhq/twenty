import { type ApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/types/application-reach-metadata-name.type';

export const APPLICATION_REACH_METADATA_NAMES = [
  'logicFunction',
  'agent',
  'skill',
  'frontComponent',
  'webhook',
  'applicationVariable',
  'connectionProvider',
  'workflow',
  'workflowVersion',
] as const satisfies readonly ApplicationReachMetadataName[];
