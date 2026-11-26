import { type ConditionalAvailabilityCurrentUserContext } from '@/conditional-availability/types/ConditionalAvailabilityCurrentUserContext';

export const EMPTY_CONDITIONAL_AVAILABILITY_CURRENT_USER_CONTEXT: ConditionalAvailabilityCurrentUserContext =
  {
    featureFlags: {},
    permissionFlags: {},
    currentRole: { universalIdentifier: null },
    currentWorkspaceMember: { id: null },
  };
