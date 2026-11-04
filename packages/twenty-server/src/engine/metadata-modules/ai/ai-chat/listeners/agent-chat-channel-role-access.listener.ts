import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { AgentChatChannelGrantService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-grant.service';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const ALL_CHANNELS_ACCESS_PROPERTY = 'canAccessAllAgentChatChannels';

const hasAllChannelsAccess = (role: object): boolean =>
  ALL_CHANNELS_ACCESS_PROPERTY in role &&
  role[ALL_CHANNELS_ACCESS_PROPERTY] === true;

const isAllChannelsAccessChanged = (event: MetadataEvent): boolean => {
  switch (event.type) {
    case 'created':
      return hasAllChannelsAccess(event.properties.after);
    case 'updated':
      return ALL_CHANNELS_ACCESS_PROPERTY in event.properties.diff;
    case 'deleted':
      return hasAllChannelsAccess(event.properties.before);
  }
};

// Roles also change through AI role tools and app syncs, not only role mutations
@Injectable()
export class AgentChatChannelRoleAccessListener {
  constructor(
    private readonly channelGrantService: AgentChatChannelGrantService,
  ) {}

  @OnEvent('metadata.role.created')
  async handleCreatedRoles(batch: MetadataEventBatch<'role'>): Promise<void> {
    await this.rewriteGrantsIfAccessChanged(batch);
  }

  @OnEvent('metadata.role.updated')
  async handleUpdatedRoles(batch: MetadataEventBatch<'role'>): Promise<void> {
    await this.rewriteGrantsIfAccessChanged(batch);
  }

  @OnEvent('metadata.role.deleted')
  async handleDeletedRoles(batch: MetadataEventBatch<'role'>): Promise<void> {
    await this.rewriteGrantsIfAccessChanged(batch);
  }

  private async rewriteGrantsIfAccessChanged({
    workspaceId,
    events,
  }: MetadataEventBatch<'role'>): Promise<void> {
    if (!events.some(isAllChannelsAccessChanged)) {
      return;
    }

    await this.channelGrantService.enqueueChannelGrantsRewrite({ workspaceId });
  }
}
