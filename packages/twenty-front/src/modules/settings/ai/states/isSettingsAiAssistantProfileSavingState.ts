import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSettingsAiAssistantProfileSavingState = createAtomState<boolean>(
  {
    key: 'isSettingsAiAssistantProfileSavingState',
    defaultValue: false,
  },
);
