import { type useConditionalAvailabilityDraft } from '@/conditional-availability/hooks/useConditionalAvailabilityDraft';
import { type useConditionalAvailabilityRoles } from '@/conditional-availability/hooks/useConditionalAvailabilityRoles';

export type ConditionalAvailabilityEditorContextValue = ReturnType<
  typeof useConditionalAvailabilityDraft
> &
  ReturnType<typeof useConditionalAvailabilityRoles> & {
    itemKey: string;
    isReadOnly: boolean;
  };
