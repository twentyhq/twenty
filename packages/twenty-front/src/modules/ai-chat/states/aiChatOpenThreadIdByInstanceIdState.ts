import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const aiChatOpenThreadIdByInstanceIdState = createAtomState<
  Record<string, string>
>({
  key: 'ai/aiChatOpenThreadIdByInstanceIdState',
  defaultValue: {},
});
