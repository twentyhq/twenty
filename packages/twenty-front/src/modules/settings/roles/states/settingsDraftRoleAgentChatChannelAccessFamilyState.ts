import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsDraftRoleAgentChatChannelAccessFamilyState =
  createAtomFamilyState<Record<string, boolean>, string>({
    key: 'settingsDraftRoleAgentChatChannelAccessFamilyState',
    scope: 'routed-flow',
    defaultValue: {},
  });
