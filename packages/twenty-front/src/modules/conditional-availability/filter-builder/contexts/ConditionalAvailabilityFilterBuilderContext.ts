import { type ConditionalAvailabilityFilterBuilderContextValue } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterBuilderContextValue';
import { createRequiredContext } from '~/utils/createRequiredContext';

export const [
  ConditionalAvailabilityFilterBuilderContextProvider,
  useConditionalAvailabilityFilterBuilderContextOrThrow,
] = createRequiredContext<ConditionalAvailabilityFilterBuilderContextValue>(
  'ConditionalAvailabilityFilterBuilderContext',
);
