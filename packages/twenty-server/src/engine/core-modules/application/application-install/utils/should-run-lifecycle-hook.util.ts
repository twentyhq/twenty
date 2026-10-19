import { isDefined } from 'twenty-shared/utils';

export const shouldRunLifecycleHook = ({
  hook,
  isVersionUpgrade,
}: {
  hook: { shouldRunOnVersionUpgrade?: boolean } | undefined;
  isVersionUpgrade: boolean;
}): boolean =>
  isDefined(hook) && !(isVersionUpgrade && !hook.shouldRunOnVersionUpgrade);
