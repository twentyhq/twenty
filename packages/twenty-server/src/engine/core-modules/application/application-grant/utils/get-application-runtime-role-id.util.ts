import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export type ApplicationWithRuntimeRole = Pick<FlatApplication, 'defaultRoleId'> &
  Partial<
    Pick<
      FlatApplication,
      'runtimeRoleId' | 'isGrantExempt' | 'approvedRoleRequest'
    >
  >;

// Outside the flat application cache, only exempt applications have no approved request
export const isApplicationGrantExempt = (
  application: ApplicationWithRuntimeRole,
): boolean =>
  application.isGrantExempt ?? !isDefined(application.approvedRoleRequest);

// The role an application runs with: confined applications run with their grant, the Twenty
// standard and workspace custom applications with their own role.
export const getApplicationRuntimeRoleId = (
  application: ApplicationWithRuntimeRole,
): string | null => {
  if (application.runtimeRoleId !== undefined) {
    return application.runtimeRoleId;
  }

  return isApplicationGrantExempt(application)
    ? application.defaultRoleId
    : null;
};
