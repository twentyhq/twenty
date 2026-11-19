import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
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
    Icon: IconUserCircle,
    label: msg`Role`,
  },
  workspaceMember: {
    Icon: IconUser,
    label: msg`Workspace member`,
  },
  device: {
    Icon: IconPhone,
    label: msg`Device`,
  },
} as const satisfies Record<
  ConditionalAvailabilityPathSubject,
  {
    Icon: IconComponent;
    label: MessageDescriptor;
  }
>;
