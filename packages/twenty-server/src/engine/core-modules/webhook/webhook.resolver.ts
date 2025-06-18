import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { WebhookEntity } from './webhook.entity';
import { WebhookService } from './webhook.service';

@Resolver(() => WebhookEntity)
@UseGuards(WorkspaceAuthGuard)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [WebhookEntity])
  async webhooks(
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<WebhookEntity[]> {
    return this.webhookService.findByWorkspaceId(workspaceId);
  }

  @Query(() => WebhookEntity, { nullable: true })
  async webhook(
    @Args('id') id: string,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<WebhookEntity | null> {
    return this.webhookService.findById(id, workspaceId);
  }

  @Mutation(() => WebhookEntity)
  async createWebhook(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('targetUrl') targetUrl: string,
    @Args('operations', { type: () => [String] }) operations: string[],
    @Args('description', { nullable: true }) description?: string,
    @Args('secret', { nullable: true }) secret?: string,
  ): Promise<WebhookEntity> {
    this.webhookService.validateWebhookUrl(targetUrl);

    return this.webhookService.create({
      targetUrl,
      operations,
      description,
      workspaceId,
      secret: secret || '',
    });
  }

  @Mutation(() => WebhookEntity, { nullable: true })
  async updateWebhook(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('id') id: string,
    @Args('targetUrl', { nullable: true }) targetUrl?: string,
    @Args('operations', { type: () => [String], nullable: true })
    operations?: string[],
    @Args('description', { nullable: true }) description?: string,
    @Args('secret', { nullable: true }) secret?: string,
  ): Promise<WebhookEntity | null> {
    if (targetUrl) {
      this.webhookService.validateWebhookUrl(targetUrl);
    }

    return this.webhookService.update(id, workspaceId, {
      ...(targetUrl && { targetUrl }),
      ...(operations && { operations }),
      ...(description !== undefined && { description }),
      ...(secret !== undefined && { secret }),
    });
  }

  @Mutation(() => Boolean)
  async deleteWebhook(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.webhookService.delete(id, workspaceId);
  }
}
