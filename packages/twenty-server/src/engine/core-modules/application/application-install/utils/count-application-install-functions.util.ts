import { type Manifest } from 'twenty-shared/application';

import {
  countLifecycleHooksToRun,
  type ManifestLifecycleHooks,
} from 'src/engine/core-modules/application/application-install/utils/count-lifecycle-hooks-to-run.util';

export type ApplicationInstallFunctionsManifest = ManifestLifecycleHooks &
  Partial<Pick<Manifest, 'logicFunctions'>>;

export const countApplicationInstallFunctions = ({
  manifest,
  isVersionUpgrade,
}: {
  manifest: ApplicationInstallFunctionsManifest | null;
  isVersionUpgrade: boolean;
}): number =>
  countLifecycleHooksToRun({ manifest, isVersionUpgrade }) +
  (manifest?.logicFunctions ?? []).length;
