import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { type SelectOption } from 'twenty-ui/primitives/input';

export type ConditionalAvailabilityFilterBuilderContextValue = {
  rootFilterGroup: ConditionalAvailabilityFilterGroup;
  onRootFilterGroupChange: (
    rootFilterGroup: ConditionalAvailabilityFilterGroup,
  ) => void;
  roleOptions: SelectOption<string>[];
  workspaceMemberOptions: SelectOption<string>[];
  isReadOnly: boolean;
};
