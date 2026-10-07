import { Injectable } from '@nestjs/common';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type ResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

// Channels are OPEN only so their chats can be written through them. Their
// memberships, grants and chats change together, which only the channel
// resolvers do, so the record API never writes a channel itself
class RefuseAgentChatChannelRecordWrite implements WorkspacePreQueryHookInstance {
  async execute(): Promise<ResolverArgs> {
    throw new PermissionsException(
      'Chat channels are changed through the chat channel API',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }
}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.createOne',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelCreateOnePreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.createMany',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelCreateManyPreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.updateOne',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelUpdateOnePreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.updateMany',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelUpdateManyPreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.deleteOne',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelDeleteOnePreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.deleteMany',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelDeleteManyPreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.destroyOne',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelDestroyOnePreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.destroyMany',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelDestroyManyPreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.restoreOne',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelRestoreOnePreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.restoreMany',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelRestoreManyPreQueryHook extends RefuseAgentChatChannelRecordWrite {}

@Injectable()
@WorkspaceQueryHook({
  key: 'agentChatChannel.mergeMany',
  type: WorkspaceQueryHookType.PRE_HOOK,
})
export class AgentChatChannelMergeManyPreQueryHook extends RefuseAgentChatChannelRecordWrite {}

export const AGENT_CHAT_CHANNEL_WRITE_PRE_QUERY_HOOKS = [
  AgentChatChannelCreateOnePreQueryHook,
  AgentChatChannelCreateManyPreQueryHook,
  AgentChatChannelUpdateOnePreQueryHook,
  AgentChatChannelUpdateManyPreQueryHook,
  AgentChatChannelDeleteOnePreQueryHook,
  AgentChatChannelDeleteManyPreQueryHook,
  AgentChatChannelDestroyOnePreQueryHook,
  AgentChatChannelDestroyManyPreQueryHook,
  AgentChatChannelRestoreOnePreQueryHook,
  AgentChatChannelRestoreManyPreQueryHook,
  AgentChatChannelMergeManyPreQueryHook,
];
