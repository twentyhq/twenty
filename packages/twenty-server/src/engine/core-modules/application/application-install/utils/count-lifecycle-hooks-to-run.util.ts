import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const countLifecycleHooksToRun = ({
  manifest,
  isVersionUpgrade,
}: {
  manifest: Manifest | null;
  isVersionUpgrade: boolean;
}): number =>
  [
    manifest?.application.preInstallLogicFunction,
    manifest?.application.postInstallLogicFunction,
  ].filter(
    (hook) =>
      isDefined(hook) &&
      (!isVersionUpgrade || hook.shouldRunOnVersionUpgrade === true),
  ).length;
