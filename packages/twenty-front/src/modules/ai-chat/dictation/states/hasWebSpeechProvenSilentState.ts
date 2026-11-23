import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const hasWebSpeechProvenSilentState = createAtomState<boolean>({
  key: 'ai/hasWebSpeechProvenSilent',
  defaultValue: false,
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
