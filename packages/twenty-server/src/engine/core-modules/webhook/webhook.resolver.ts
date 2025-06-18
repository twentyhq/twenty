import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { Webhook } from './webhook.entity';
import { WebhookService } from './webhook.service';

@Resolver(() => Webhook)
@UseGuards(WorkspaceAuthGuard)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [Webhook])
  async webhooks(@AuthWorkspace() workspace: Workspace): Promise<Webhook[]> {
    return this.webhookService.findByWorkspaceId(workspace.id);
  }

  @Query(() => Webhook, { nullable: true })
  async webhook(
    @Args('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Webhook | null> {
    return this.webhookService.findById(id, workspace.id);
  }

  @Mutation(() => Webhook)
  async createWebhook(
    @AuthWorkspace() workspace: Workspace,
    @Args('targetUrl') targetUrl: string,
    @Args('operations', { type: () => [String] }) operations: string[],
    @Args('description', { nullable: true }) description?: string,
    @Args('secret', { nullable: true }) secret?: string,
  ): Promise<Webhook> {
    return this.webhookService.create({
      targetUrl,
      operations,
      description,
      secret,
      workspaceId: workspace.id,
    });
  }

  @Mutation(() => Webhook, { nullable: true })
  async updateWebhook(
    @AuthWorkspace() workspace: Workspace,
    @Args('id') id: string,
    @Args('targetUrl', { nullable: true }) targetUrl?: string,
    @Args('operations', { type: () => [String], nullable: true })
    operations?: string[],
    @Args('description', { nullable: true }) description?: string,
    @Args('secret', { nullable: true }) secret?: string,
  ): Promise<Webhook | null> {
    const updateData: Partial<Webhook> = {};

    if (targetUrl !== undefined) updateData.targetUrl = targetUrl;
    if (operations !== undefined) updateData.operations = operations;
    if (description !== undefined) updateData.description = description;
    if (secret !== undefined) updateData.secret = secret;

    return this.webhookService.update(id, workspace.id, updateData);
  }

  @Mutation(() => Boolean)
  async deleteWebhook(
    @Args('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.webhookService.delete(id, workspace.id);

    return result !== null;
  }
}
