import uniqBy from 'lodash.uniqby';
import { isDefined } from 'twenty-shared/utils';

import { type AgentChatThreadTargetRecord } from '@/ai/types/AgentChatThreadTargetRecord';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';

export const getChatThreadsForRecordPage = ({
  links,
  pageSize,
}: {
  links: AgentChatThreadTargetRecord[];
  pageSize: number;
}) => ({
  threads: sortChatThreadsByLastActivityDesc(
    uniqBy(links.map(({ thread }) => thread).filter(isDefined), 'id'),
  ),
  refetchLimit: Math.max(links.length, pageSize),
});
