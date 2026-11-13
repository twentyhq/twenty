import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { chatThreadComposerDraftFamilyState } from '@/activities/emails/states/chatThreadComposerDraftFamilyState';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

export const useChatThreadComposerDraft = (draftKey: string | undefined) => {
  const [localDraft, setLocalDraft] = useState('');
  const [persistedDraft, setPersistedDraft] = useAtomFamilyState(
    chatThreadComposerDraftFamilyState,
    draftKey ?? '',
  );

  return isDefined(draftKey)
    ? ([persistedDraft, setPersistedDraft] as const)
    : ([localDraft, setLocalDraft] as const);
};
