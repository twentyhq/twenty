import { inboxDisplayedThreadMessagesSelector } from '@/ai/states/selectors/inboxDisplayedThreadMessagesSelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const inboxMessageIdsSelector = createAtomSelector<string[]>({
  key: 'inboxMessageIdsSelector',
  get: ({ get }) =>
    get(inboxDisplayedThreadMessagesSelector).map((message) => message.id),
});
