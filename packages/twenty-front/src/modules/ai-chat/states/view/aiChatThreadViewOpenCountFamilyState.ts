import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatThreadViewOpenCountFamilyState = createAtomFamilyState<
  number,
  { threadId: string }
>({
  key: 'aiChatThreadViewOpenCountFamilyState',
  defaultValue: 0,
});
