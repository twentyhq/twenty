import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';

export type ConditionalAvailabilityFilterBuilderContextValue = {
  onFilterSettingsUpdate: (
    filterSettings: ConditionalAvailabilityFilterGroup,
  ) => void;
  readonly: boolean;
};
