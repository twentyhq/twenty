import { type ConditionalAvailabilityEditorContextValue } from '@/conditional-availability/types/ConditionalAvailabilityEditorContextValue';
import { createRequiredContext } from '~/utils/createRequiredContext';

export const [
  ConditionalAvailabilityEditorProvider,
  useConditionalAvailabilityEditorContext,
] = createRequiredContext<ConditionalAvailabilityEditorContextValue>(
  'ConditionalAvailabilityEditor',
);
