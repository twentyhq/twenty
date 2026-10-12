import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Keyed by the File itself, like agentChatSelectedFilesState, so two
// attachments sharing a name never abort each other. Holds live
// AbortControllers, so it is never persisted.
export const agentChatUploadAbortControllersState = createAtomState<
  Map<File, AbortController>
>({
  key: 'ai/agentChatUploadAbortControllersState',
  defaultValue: new Map(),
});
