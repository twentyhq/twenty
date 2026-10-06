import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Arguments staged for a proposed call before the person decides: undefined until edited, null
// while they do not parse, which blocks approving.
export const agentChatToolCallArgumentsFamilyState = createAtomFamilyState<
  Record<string, unknown> | null | undefined,
  string
>({
  key: 'agentChatToolCallArgumentsFamilyState',
  defaultValue: undefined,
});
