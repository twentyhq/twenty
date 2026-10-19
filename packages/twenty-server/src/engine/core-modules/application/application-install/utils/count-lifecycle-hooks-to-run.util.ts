import { type Manifest } from 'twenty-shared/application';

import { shouldRunLifecycleHook } from 'src/engine/core-modules/application/application-install/utils/should-run-lifecycle-hook.util';

export type ManifestLifecycleHooks = {
  application: Pick<
    Manifest['application'],
    'preInstallLogicFunction' | 'postInstallLogicFunction'
  >;
};

export const countLifecycleHooksToRun = ({
  manifest,
  isVersionUpgrade,
}: {
  manifest: ManifestLifecycleHooks | null;
  isVersionUpgrade: boolean;
}): number =>
  [
    manifest?.application.preInstallLogicFunction,
    manifest?.application.postInstallLogicFunction,
  ].filter((hook) => shouldRunLifecycleHook({ hook, isVersionUpgrade })).length;
