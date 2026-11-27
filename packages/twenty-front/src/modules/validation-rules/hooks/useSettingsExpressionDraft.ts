import { useEffect } from 'react';

import { settingsExpressionDraftState } from '@/ai-chat/states/settingsExpressionDraftState';
import { type SettingsExpressionDraftKind } from '@/ai-chat/types/SettingsExpressionDraft';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSettingsExpressionDraft = (
  kind: SettingsExpressionDraftKind,
) => {
  const setSettingsExpressionDraft = useSetAtomState(
    settingsExpressionDraftState,
  );

  useEffect(
    () => () => setSettingsExpressionDraft(null),
    [setSettingsExpressionDraft],
  );

  const setExpressionDraft = (expression: string) =>
    setSettingsExpressionDraft({ kind, expression });

  return { setExpressionDraft };
};
