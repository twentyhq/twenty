import { type Manifest } from 'twenty-shared/application';

import { type AppPullTarget } from '@/application-build/pull/types';
import { PULL_BASE_FILE_PATH } from '@/cli/utilities/pull/pull-base-file';

export const createPullBaseWrite = ({
  target,
  manifest,
  unreconciledUniversalIdentifiers = [],
}: {
  target: AppPullTarget;
  manifest: Manifest;
  unreconciledUniversalIdentifiers?: string[];
}) => ({
  relativePath: PULL_BASE_FILE_PATH,
  content: `${JSON.stringify(
    {
      version: 2,
      target,
      applicationUniversalIdentifier: manifest.application.universalIdentifier,
      manifest,
      ...(unreconciledUniversalIdentifiers.length > 0
        ? { unreconciledUniversalIdentifiers }
        : {}),
    },
    null,
    2,
  )}\n`,
});
