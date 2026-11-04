import uniqBy from 'lodash.uniqby';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
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
  refetchLimit: Math.min(Math.max(links.length, pageSize), QUERY_MAX_RECORDS),
});
