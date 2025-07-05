import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateWebhookDTO } from 'src/engine/core-modules/webhook/dtos/create-webhook.dto';
import { DeleteWebhookDTO } from 'src/engine/core-modules/webhook/dtos/delete-webhook.dto';
import { GetWebhookDTO } from 'src/engine/core-modules/webhook/dtos/get-webhook.dto';
import { UpdateWebhookDTO } from 'src/engine/core-modules/webhook/dtos/update-webhook.dto';
import { webhookGraphqlApiExceptionHandler } from 'src/engine/core-modules/webhook/utils/webhook-graphql-api-exception-handler.util';
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
    @Args('input') input: GetWebhookDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Webhook | null> {
    return this.webhookService.findById(input.id, workspace.id);
  }

  @Mutation(() => Webhook)
  async createWebhook(
    @AuthWorkspace() workspace: Workspace,
    @Args('input') input: CreateWebhookDTO,
  ): Promise<Webhook> {
    try {
      return await this.webhookService.create({
        targetUrl: input.targetUrl,
        operations: input.operations,
        description: input.description,
        secret: input.secret,
        workspaceId: workspace.id,
      });
    } catch (error) {
      webhookGraphqlApiExceptionHandler(error);
      throw error; // This line will never be reached but satisfies TypeScript
    }
  }

  @Mutation(() => Webhook, { nullable: true })
  async updateWebhook(
    @AuthWorkspace() workspace: Workspace,
    @Args('input') input: UpdateWebhookDTO,
  ): Promise<Webhook | null> {
    try {
      const updateData: Partial<Webhook> = {};

      if (input.targetUrl !== undefined) updateData.targetUrl = input.targetUrl;
      if (input.operations !== undefined)
        updateData.operations = input.operations;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.secret !== undefined) updateData.secret = input.secret;

      return await this.webhookService.update(
        input.id,
        workspace.id,
        updateData,
      );
    } catch (error) {
      webhookGraphqlApiExceptionHandler(error);
      throw error; // This line will never be reached but satisfies TypeScript
    }
  }

  @Mutation(() => Boolean)
  async deleteWebhook(
    @Args('input') input: DeleteWebhookDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.webhookService.delete(input.id, workspace.id);

    return result !== null;
  }
}
