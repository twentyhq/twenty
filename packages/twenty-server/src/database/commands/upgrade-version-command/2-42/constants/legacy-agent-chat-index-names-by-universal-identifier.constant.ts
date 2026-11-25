import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const {
  agentChatThread,
  agentChatThreadParticipant,
  agentChatThreadTarget,
  agentMessage,
  agentMessagePart,
  agentMessageReaction,
  attachment,
} = STANDARD_OBJECTS;

export const LEGACY_AGENT_CHAT_INDEX_NAMES_BY_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, string>
> = {
  [agentChatThread.indexes.directMessagePairUniqueIndex.universalIdentifier]:
    'IDX_UNIQUE_2e7fe677ecee1914250716dd94e',
  [agentChatThread.indexes.workspaceMemberIndex.universalIdentifier]:
    'IDX_7579399b4a20615f1b1e4b06f61',
  [agentChatThread.indexes.assigneeIndex.universalIdentifier]:
    'IDX_d2c427300cfaa66582eace551a6',
  [agentChatThread.indexes.channelLastActivityIndex.universalIdentifier]:
    'IDX_36a243090edb9abec66fdaf501b',
  [agentChatThreadParticipant.indexes.threadWorkspaceMemberUniqueIndex
    .universalIdentifier]: 'IDX_UNIQUE_aba87cbda880a133d7bf08867c1',
  [agentChatThreadParticipant.indexes.workspaceMemberIndex.universalIdentifier]:
    'IDX_7f4bdb408d2be2acc757c58b122',
  [agentChatThreadTarget.indexes.threadIdIndex.universalIdentifier]:
    'IDX_883e4188651697bc2a3d765462c',
  [agentChatThreadTarget.indexes.personIdIndex.universalIdentifier]:
    'IDX_f1441ffea34b02323606d22c751',
  [agentChatThreadTarget.indexes.companyIdIndex.universalIdentifier]:
    'IDX_d250cf8fc007e3ae5ab5c206b92',
  [agentChatThreadTarget.indexes.opportunityIdIndex.universalIdentifier]:
    'IDX_aa4205942a2300605ed6531335f',
  [agentChatThreadTarget.indexes.threadPersonUniqueIndex.universalIdentifier]:
    'IDX_UNIQUE_06b56491f0f07b397a2593de27c',
  [agentChatThreadTarget.indexes.threadCompanyUniqueIndex.universalIdentifier]:
    'IDX_UNIQUE_7d44a0a2eb17d4a62633fdada52',
  [agentChatThreadTarget.indexes.threadOpportunityUniqueIndex
    .universalIdentifier]: 'IDX_UNIQUE_5b7dc38ea61fa3881934d8d9c30',
  [agentMessage.indexes.agentIndex.universalIdentifier]:
    'IDX_13be808510150ca50bd11943549',
  [agentMessage.indexes.threadIndex.universalIdentifier]:
    'IDX_1094cdc601242db548c93bb9f9a',
  [agentMessage.indexes.turnIndex.universalIdentifier]:
    'IDX_8b3b9fa5cb58ad45fd61eba8c6c',
  [agentMessage.indexes.senderWorkspaceMemberIndex.universalIdentifier]:
    'IDX_df649f6cb2045b56149f294972f',
  [agentMessagePart.indexes.messageOrderIndex.universalIdentifier]:
    'IDX_46d260f179659e359685d025b55',
  [agentMessageReaction.indexes.messageWorkspaceMemberEmojiUniqueIndex
    .universalIdentifier]: 'IDX_UNIQUE_1d5a5eaa9988b2094229723149a',
  [agentMessageReaction.indexes.workspaceMemberIndex.universalIdentifier]:
    'IDX_84ba2c3b79b6421fb7a5f55df28',
  [attachment.indexes.agentChatThreadIdIndex.universalIdentifier]:
    'IDX_64d57b165b3cd64f71fe8a0ea4c',
};
