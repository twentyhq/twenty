import { isDefined } from 'twenty-shared/utils';

export const resolveRunsWithUserAuthority = ({
  runsWithUserAuthority,
  httpRouteTriggerSettings,
}: {
  runsWithUserAuthority: boolean | null;
  httpRouteTriggerSettings: { isAuthRequired: boolean } | null;
}): boolean => {
  if (isDefined(runsWithUserAuthority)) {
    return runsWithUserAuthority;
  }

  // Undeclared means the function predates the setting, so it keeps what its
  // trigger used to impose: authenticated routes bound the caller to the token,
  // every other trigger ran as the application.
  return httpRouteTriggerSettings?.isAuthRequired ?? false;
};
