import { type ConditionalAvailabilityCurrentUserContext } from 'twenty-shared/conditional-availability';

export const EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT: ConditionalAvailabilityCurrentUserContext =
  {
    featureFlags: {},
    permissionFlags: {},
    currentRole: null,
    currentWorkspaceMember: null,
  };
