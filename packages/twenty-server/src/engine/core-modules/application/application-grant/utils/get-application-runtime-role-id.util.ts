import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';

export type ApplicationWithRuntimeRole = Pick<
  FlatApplication,
  'defaultRoleId' | 'sourceType'
> &
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
// standard and workspace custom applications with their own role, OAuth clients with none.
export const getApplicationRuntimeRoleId = (
  application: ApplicationWithRuntimeRole,
): string | null => {
  if (isOAuthOnlyApplication(application)) {
    return null;
  }

  if (application.runtimeRoleId !== undefined) {
    return application.runtimeRoleId;
  }

  return isApplicationGrantExempt(application)
    ? application.defaultRoleId
    : null;
};
