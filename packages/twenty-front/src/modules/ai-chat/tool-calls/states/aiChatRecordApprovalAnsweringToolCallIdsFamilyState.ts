import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const aiChatRecordApprovalAnsweringToolCallIdsFamilyState =
  createAtomFamilyState<string[], { threadId: string }>({
    key: 'aiChatRecordApprovalAnsweringToolCallIdsFamilyState',
    defaultValue: [],
  });
