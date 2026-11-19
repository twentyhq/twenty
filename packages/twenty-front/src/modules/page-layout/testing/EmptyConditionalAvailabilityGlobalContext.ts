import { type ConditionalAvailabilityGlobalContext } from 'twenty-shared/types';

export const EMPTY_CONDITIONAL_AVAILABILITY_GLOBAL_CONTEXT: ConditionalAvailabilityGlobalContext =
  {
    featureFlags: {},
    permissionFlags: {},
    currentRole: null,
    currentWorkspaceMember: null,
  };
