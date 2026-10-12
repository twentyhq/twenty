import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Null until a channel is checked or unchecked on the role page, as the saved
// channels come from the channels themselves
export const settingsDraftRoleAgentChatChannelIdsFamilyState =
  createAtomFamilyState<string[] | null, string>({
    key: 'settingsDraftRoleAgentChatChannelIdsFamilyState',
    scope: 'routed-flow',
    defaultValue: null,
  });
