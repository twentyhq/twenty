import { type Manifest } from 'twenty-shared/application';

import { countLifecycleHooksToRun } from 'src/engine/core-modules/application/application-install/utils/count-lifecycle-hooks-to-run.util';

// Hooks install their bundle when they run, then every function may be warmed up
export const countPrebuiltBundleInstalls = ({
  manifest,
  isVersionUpgrade,
}: {
  manifest: Manifest | null;
  isVersionUpgrade: boolean;
}): number =>
  countLifecycleHooksToRun({ manifest, isVersionUpgrade }) +
  (manifest?.logicFunctions ?? []).length;
