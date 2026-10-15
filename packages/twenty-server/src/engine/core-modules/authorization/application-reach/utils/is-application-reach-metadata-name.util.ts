import { type AllMetadataName } from 'twenty-shared/metadata';

import { APPLICATION_REACH_METADATA_NAMES } from 'src/engine/core-modules/authorization/application-reach/constants/application-reach-metadata-names.constant';
import { type ApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/types/application-reach-metadata-name.type';

export const isApplicationReachMetadataName = (
  metadataName: AllMetadataName,
): metadataName is ApplicationReachMetadataName =>
  (APPLICATION_REACH_METADATA_NAMES as readonly string[]).includes(
    metadataName,
  );
