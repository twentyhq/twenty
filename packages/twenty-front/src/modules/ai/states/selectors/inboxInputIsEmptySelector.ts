import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isNonEmptyString } from '@sniptt/guards';

// The editor stores an empty draft whenever its text is whitespace only
export const inboxInputIsEmptySelector = createAtomSelector<boolean>({
  key: 'inboxInputIsEmptySelector',
  get: ({ get }) => {
    const draftKey = get(currentInboxThreadState) ?? get(newInboxThreadIdState);

    return !isNonEmptyString(get(inboxDraftsByThreadIdState)[draftKey]);
  },
});
