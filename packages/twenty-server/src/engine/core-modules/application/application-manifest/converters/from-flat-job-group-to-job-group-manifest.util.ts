import { type JobGroupManifest } from 'twenty-shared/application';

import { type FlatJobGroup } from 'src/engine/metadata-modules/flat-job-group/types/flat-job-group.type';

export const fromFlatJobGroupToJobGroupManifest = (
  flatJobGroup: FlatJobGroup,
): JobGroupManifest => ({
  universalIdentifier: flatJobGroup.universalIdentifier,
  name: flatJobGroup.name,
  limiter: flatJobGroup.limiter,
});
