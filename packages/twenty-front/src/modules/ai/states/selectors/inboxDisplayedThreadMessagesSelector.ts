import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export const inboxDisplayedThreadMessagesSelector = createAtomSelector<
  ExtendedUIMessage[]
>({
  key: 'inboxDisplayedThreadMessagesSelector',
  get: ({ get }) =>
    get(inboxMessagesFamilyState, {
      threadId: get(inboxDisplayedThreadState),
    }),
});
