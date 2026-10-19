import { type Manifest } from 'twenty-shared/application';

import { shouldRunLifecycleHook } from 'src/engine/core-modules/application/application-install/utils/should-run-lifecycle-hook.util';

export type ApplicationInstallFunctionsManifest = {
  application: Pick<
    Manifest['application'],
    'preInstallLogicFunction' | 'postInstallLogicFunction'
  >;
} & Partial<Pick<Manifest, 'logicFunctions'>>;

export const countApplicationInstallFunctions = ({
  manifest,
  isVersionUpgrade,
}: {
  manifest: ApplicationInstallFunctionsManifest | null;
  isVersionUpgrade: boolean;
}): number =>
  [
    manifest?.application.preInstallLogicFunction,
    manifest?.application.postInstallLogicFunction,
  ].filter((hook) => shouldRunLifecycleHook({ hook, isVersionUpgrade }))
    .length + (manifest?.logicFunctions ?? []).length;
