import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PermissionFlagType } from 'twenty-shared/constants';

import { CreateWebhookInput } from 'src/engine/core-modules/webhook/dtos/create-webhook.dto';
import { DeleteWebhookInput } from 'src/engine/core-modules/webhook/dtos/delete-webhook.dto';
import { GetWebhookInput } from 'src/engine/core-modules/webhook/dtos/get-webhook.dto';
import { UpdateWebhookInput } from 'src/engine/core-modules/webhook/dtos/update-webhook.dto';
import { webhookGraphqlApiExceptionHandler } from 'src/engine/core-modules/webhook/utils/webhook-graphql-api-exception-handler.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { WebhookEntity } from './webhook.entity';
import { WebhookService } from './webhook.service';

@Resolver(() => WebhookEntity)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.API_KEYS_AND_WEBHOOKS),
)
export class WebhookResolver {
  constructor(private readonly webhookService: WebhookService) {}

  @Query(() => [WebhookEntity])
  async webhooks(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookEntity[]> {
    return this.webhookService.findByWorkspaceId(workspace.id);
  }

  @Query(() => WebhookEntity, { nullable: true })
  async webhook(
    @Args('input') input: GetWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<WebhookEntity | null> {
    return this.webhookService.findById(input.id, workspace.id);
  }

  @Mutation(() => WebhookEntity)
  async createWebhook(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateWebhookInput,
  ): Promise<WebhookEntity> {
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

  @Mutation(() => WebhookEntity, { nullable: true })
  async updateWebhook(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UpdateWebhookInput,
  ): Promise<WebhookEntity | null> {
    try {
      const updateData: QueryDeepPartialEntity<WebhookEntity> = {};

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
    @Args('input') input: DeleteWebhookInput,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<boolean> {
    const result = await this.webhookService.delete(input.id, workspace.id);

    return result !== null;
  }
}
