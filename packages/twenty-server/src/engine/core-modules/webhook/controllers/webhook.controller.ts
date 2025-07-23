import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { CreateWebhookDTO } from 'src/engine/core-modules/webhook/dtos/create-webhook.dto';
import { UpdateWebhookDTO } from 'src/engine/core-modules/webhook/dtos/update-webhook.dto';
import { Webhook } from 'src/engine/core-modules/webhook/webhook.entity';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

/**
 * rest/webhooks is deprecated, use rest/metadata/webhooks instead
 * rest/webhooks will be removed in the future
 */
@Controller(['rest/webhooks', 'rest/metadata/webhooks'])
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  async findAll(@AuthWorkspace() workspace: Workspace): Promise<Webhook[]> {
    return this.webhookService.findByWorkspaceId(workspace.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Webhook | null> {
    return this.webhookService.findById(id, workspace.id);
  }

  @Post()
  async create(
    @Body() createWebhookDto: CreateWebhookDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Webhook> {
    return this.webhookService.create({
      targetUrl: createWebhookDto.targetUrl,
      operations: createWebhookDto.operations || ['*.*'],
      description: createWebhookDto.description,
      secret: createWebhookDto.secret,
      workspaceId: workspace.id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWebhookDto: UpdateWebhookDTO,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<Webhook | null> {
    return this.webhookService.update(id, workspace.id, updateWebhookDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<boolean> {
    const result = await this.webhookService.delete(id, workspace.id);

    return result !== null;
  }
}
