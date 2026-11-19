import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { type ConditionalAvailabilitySubjectSection } from '@/conditional-availability/types/ConditionalAvailabilitySubjectSection';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type IconComponent,
  IconPhone,
  IconUser,
  IconUserCircle,
} from 'twenty-ui/icon';

export const CONDITIONAL_AVAILABILITY_SUBJECT_DEFINITIONS = {
  role: {
    section: 'currentUser',
    Icon: IconUserCircle,
    label: msg`Role`,
  },
  workspaceMember: {
    section: 'currentUser',
    Icon: IconUser,
    label: msg`Workspace member`,
  },
  device: {
    section: 'device',
    Icon: IconPhone,
    label: msg`Device`,
  },
} as const satisfies Record<
  ConditionalAvailabilitySubject,
  {
    section: ConditionalAvailabilitySubjectSection;
    Icon: IconComponent;
    label: MessageDescriptor;
  }
>;
