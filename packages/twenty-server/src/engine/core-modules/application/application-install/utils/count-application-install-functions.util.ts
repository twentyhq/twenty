import {
  countLifecycleHooksToRun,
  type ManifestLifecycleHooks,
} from 'src/engine/core-modules/application/application-install/utils/count-lifecycle-hooks-to-run.util';

export const countApplicationInstallFunctions = ({
  manifest,
  isVersionUpgrade,
}: {
  manifest: (ManifestLifecycleHooks & { logicFunctions?: unknown[] }) | null;
  isVersionUpgrade: boolean;
}): number =>
  countLifecycleHooksToRun({ manifest, isVersionUpgrade }) +
  (manifest?.logicFunctions ?? []).length;
