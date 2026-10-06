import { CoreObjectNameSingular } from 'twenty-shared/types';

import type { MentionSearchResult } from '@/mention/types/MentionSearchResult';

export const isWorkspaceMemberMentionSearchResult = ({
  objectNameSingular,
}: Pick<MentionSearchResult, 'objectNameSingular'>) =>
  objectNameSingular === CoreObjectNameSingular.WorkspaceMember;
