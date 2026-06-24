import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Carries the application a new public domain will be bound to while navigating to the create form.
export const selectedApplicationIdForPublicDomainState = createAtomState<
  string | undefined
>({
  key: 'selectedApplicationIdForPublicDomainState',
  defaultValue: undefined,
});
