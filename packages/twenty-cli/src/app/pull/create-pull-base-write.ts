import { isDefined } from 'twenty-shared/utils';

import { PULL_BASE_FILE_PATH } from '@/app/constants/pull-base-file-path.constant';
import { normalizePullTarget } from '@/app/pull/normalize-pull-target';
import { type ExportedManifest } from '@/app/types/exported-manifest.type';
import { type PullTarget } from '@/app/types/pull-target.type';

const compareRelativePaths = (
  [first]: [string, string],
  [second]: [string, string],
) => (first < second ? -1 : first > second ? 1 : 0);

const sortFingerprints = (fingerprints: Record<string, string>) =>
  Object.fromEntries(Object.entries(fingerprints).sort(compareRelativePaths));

export const createPullBaseWrite = ({
  manifest,
  target,
  unreconciledUniversalIdentifiers = [],
  sourceFingerprints,
  dependencyFingerprints,
}: {
  manifest: ExportedManifest;
  target: PullTarget;
  unreconciledUniversalIdentifiers?: string[];
  sourceFingerprints?: Record<string, string>;
  dependencyFingerprints?: Record<string, string>;
}) => ({
  relativePath: PULL_BASE_FILE_PATH,
  content: `${JSON.stringify(
    {
      version: 2,
      target: normalizePullTarget(target),
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
      manifest,
      ...(unreconciledUniversalIdentifiers.length > 0
        ? { unreconciledUniversalIdentifiers }
        : {}),
      ...(isDefined(dependencyFingerprints)
        ? {
            dependencyFingerprints: sortFingerprints(dependencyFingerprints),
          }
        : {}),
      ...(isDefined(sourceFingerprints)
        ? {
            sourceFingerprints: sortFingerprints(sourceFingerprints),
          }
        : {}),
    },
    null,
    2,
  )}\n`,
});
