import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const inboxMessagesFamilyState = createAtomFamilyState<
  ExtendedUIMessage[],
  { threadId: string | null }
>({
  key: 'inboxMessagesFamilyState',
  defaultValue: [],
});
