import { type ApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/types/application-reach-metadata-name.type';

// The other names only report what enforcing them would change
export const APPLICATION_REACH_ENFORCED_METADATA_NAMES: ReadonlySet<ApplicationReachMetadataName> =
  new Set<ApplicationReachMetadataName>(['logicFunction']);
