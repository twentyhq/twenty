import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadIsMissingFamilyState = createAtomFamilyState<
  boolean,
  { threadId: string }
>({
  key: 'aiChatThreadIsMissingFamilyState',
  defaultValue: false,
});
