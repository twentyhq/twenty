import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';

import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const inboxThreadMessageFamilySelector = createAtomFamilySelector<
  Nullable<ExtendedUIMessage>,
  { threadId: Nullable<string>; messageId: Nullable<string> }
>({
  key: 'inboxThreadMessageFamilySelector',
  get:
    ({ threadId, messageId }) =>
    ({ get }) =>
      get(inboxMessagesFamilyState, { threadId: threadId ?? null }).find(
        ({ id }) => id === messageId,
      ),
});
