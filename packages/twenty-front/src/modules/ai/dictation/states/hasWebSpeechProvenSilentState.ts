import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Per browser: a silent engine is a property of the WebView, not of the workspace or user.
export const hasWebSpeechProvenSilentState = createAtomState<boolean>({
  key: 'ai/hasWebSpeechProvenSilent',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
