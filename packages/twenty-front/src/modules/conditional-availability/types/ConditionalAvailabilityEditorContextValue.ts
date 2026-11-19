import { type useConditionalAvailabilityDraft } from '@/conditional-availability/hooks/useConditionalAvailabilityDraft';
import { type useConditionalAvailabilityFields } from '@/conditional-availability/hooks/useConditionalAvailabilityFields';
import { type useConditionalAvailabilityRoles } from '@/conditional-availability/hooks/useConditionalAvailabilityRoles';

export type ConditionalAvailabilityEditorContextValue = ReturnType<
  typeof useConditionalAvailabilityDraft
> &
  ReturnType<typeof useConditionalAvailabilityRoles> &
  ReturnType<typeof useConditionalAvailabilityFields> & {
    itemKey: string;
    isReadOnly: boolean;
  };
