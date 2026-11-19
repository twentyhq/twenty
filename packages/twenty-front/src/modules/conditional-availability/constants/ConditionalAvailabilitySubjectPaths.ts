import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';

export const CONDITIONAL_AVAILABILITY_SUBJECT_PATHS: Record<
  ConditionalAvailabilitySubject,
  string
> = {
  role: 'currentRole.universalIdentifier',
  workspaceMember: 'currentWorkspaceMember.id',
  device: 'device',
};
