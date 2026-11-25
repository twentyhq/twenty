import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { assertUnreachable } from 'twenty-shared/utils';
import {
  type IconComponent,
  IconPhone,
  IconUser,
  IconUserCircle,
} from 'twenty-ui/icon';

export const getConditionalAvailabilityFilterVariableIcon = ({
  variable,
}: {
  variable: ConditionalAvailabilityFilterVariable;
}): IconComponent => {
  switch (variable) {
    case 'currentRole':
      return IconUserCircle;
    case 'currentWorkspaceMember':
      return IconUser;
    case 'device':
      return IconPhone;
    default:
      return assertUnreachable(variable);
  }
};
