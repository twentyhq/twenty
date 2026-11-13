import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { inboxMessageAuthorLookupSelector } from '@/ai/states/selectors/inboxMessageAuthorLookupSelector';
import { getInboxMessageAuthor } from '@/ai/utils/getInboxMessageAuthor';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxMessageAuthor = (
  message: Nullable<Pick<ExtendedUIMessage, 'id' | 'role' | 'metadata'>>,
) => {
  const inboxMessageAuthorLookup = useAtomStateValue(
    inboxMessageAuthorLookupSelector,
  );

  return isDefined(message)
    ? getInboxMessageAuthor({
        message,
        authorLookup: inboxMessageAuthorLookup,
      })
    : null;
};
