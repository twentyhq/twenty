import { type SettingsExpressionDraft } from '@/ai-chat/types/SettingsExpressionDraft';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsExpressionDraftState = createAtomState<
  (SettingsExpressionDraft & { path: string }) | null
>({
  key: 'ai-chat/settingsExpressionDraftState',
  defaultValue: null,
});
