import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Remembered per browser because a silent engine is a property of this WebView
// rather than of the workspace or the user: once one has accepted start() and
// then said nothing, offering the button again only costs another recording.
export const hasWebSpeechProvenSilentState = createAtomState<boolean>({
  key: 'ai/hasWebSpeechProvenSilent',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
