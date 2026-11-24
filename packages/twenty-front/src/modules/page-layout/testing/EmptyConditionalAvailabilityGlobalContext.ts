import { type ConditionalAvailabilityGlobalContext } from 'twenty-shared/conditional-availability';

export const EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT: ConditionalAvailabilityGlobalContext =
  {
    featureFlags: {},
    permissionFlags: {},
    currentRole: null,
    currentWorkspaceMember: null,
  };
