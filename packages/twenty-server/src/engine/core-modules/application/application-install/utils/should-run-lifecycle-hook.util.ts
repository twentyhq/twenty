import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export type LifecycleHookRunSettings = Pick<
  NonNullable<Manifest['application']['preInstallLogicFunction']>,
  'shouldRunOnVersionUpgrade'
>;

export const shouldRunLifecycleHook = ({
  hook,
  isVersionUpgrade,
}: {
  hook: LifecycleHookRunSettings | undefined;
  isVersionUpgrade: boolean;
}): boolean =>
  isDefined(hook) && !(isVersionUpgrade && !hook.shouldRunOnVersionUpgrade);
