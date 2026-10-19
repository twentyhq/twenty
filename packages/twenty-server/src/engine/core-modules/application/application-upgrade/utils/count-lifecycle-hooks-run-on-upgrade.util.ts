import { type Manifest } from 'twenty-shared/application';

export const countLifecycleHooksRunOnUpgrade = (
  manifest: Manifest | null,
): number =>
  [
    manifest?.application.preInstallLogicFunction,
    manifest?.application.postInstallLogicFunction,
  ].filter((hook) => hook?.shouldRunOnVersionUpgrade === true).length;
