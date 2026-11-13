import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsDraftRoleInboxChannelAccessFamilyState =
  createAtomFamilyState<Record<string, boolean>, string>({
    key: 'settingsDraftRoleInboxChannelAccessFamilyState',
    scope: 'routed-flow',
    defaultValue: {},
  });
