import { extractRecordReferenceIds } from 'twenty-shared/ai';

import { WORKSPACE_MEMBER_OBJECT_NAME_SINGULAR } from '@/sdk/inbox/mentions/constants/workspace-member-object-name-singular';

export const extractMentionedWorkspaceMemberIds = (text: string): string[] =>
  extractRecordReferenceIds({
    text,
    objectNameSingular: WORKSPACE_MEMBER_OBJECT_NAME_SINGULAR,
  });
