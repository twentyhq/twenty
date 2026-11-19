import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';

export const CONDITIONAL_AVAILABILITY_SUBJECT_PATHS: Record<
  ConditionalAvailabilityPathSubject,
  string
> = {
  role: 'currentRole.universalIdentifier',
  workspaceMember: 'currentWorkspaceMember.id',
  device: 'device',
};
