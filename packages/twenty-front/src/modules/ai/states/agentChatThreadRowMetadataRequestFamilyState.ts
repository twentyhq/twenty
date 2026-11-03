import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const agentChatThreadRowMetadataRequestFamilyState =
  createAtomFamilyState<number, string>({
    key: 'agentChatThreadRowMetadataRequestFamilyState',
    defaultValue: 0,
  });
