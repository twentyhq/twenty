import { type JobGroupManifest } from 'twenty-shared/application';

import { type UniversalFlatJobGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-job-group.type';

export const fromJobGroupManifestToUniversalFlatJobGroup = ({
  jobGroupManifest,
  applicationUniversalIdentifier,
  now,
}: {
  jobGroupManifest: JobGroupManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatJobGroup => ({
  universalIdentifier: jobGroupManifest.universalIdentifier,
  applicationUniversalIdentifier,
  name: jobGroupManifest.name,
  limiter: jobGroupManifest.limiter,
  createdAt: now,
  updatedAt: now,
});
