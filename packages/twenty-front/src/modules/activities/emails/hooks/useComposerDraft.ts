import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';
import { type FamilyState } from '@/ui/utilities/state/jotai/types/FamilyState';

type UseComposerDraftArgs<TDraft> = {
  draftFamilyState: FamilyState<TDraft, string>;
  draftKey: string | undefined;
  defaultDraft: TDraft;
};

export const useComposerDraft = <TDraft>({
  draftFamilyState,
  draftKey,
  defaultDraft,
}: UseComposerDraftArgs<TDraft>) => {
  const [localDraft, setLocalDraft] = useState<TDraft>(defaultDraft);
  const [persistedDraft, setPersistedDraft] = useAtomFamilyState(
    draftFamilyState,
    draftKey ?? '',
  );

  return isDefined(draftKey)
    ? ([persistedDraft, setPersistedDraft] as const)
    : ([localDraft, setLocalDraft] as const);
};
