import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatIsStreamingFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string | null }
>({
  key: 'aiChatIsStreamingFamilyState',
  defaultValue: false,
});
