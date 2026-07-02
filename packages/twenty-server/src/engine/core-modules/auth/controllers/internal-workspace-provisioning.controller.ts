import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import {
  InternalWorkspaceApiKeyDto,
  InternalWorkspaceProvisioningDto,
} from 'src/engine/core-modules/auth/dto/internal-workspace-provisioning.dto';
import { InternalWorkspaceProvisioningService } from 'src/engine/core-modules/auth/services/internal-workspace-provisioning.service';
import { InternalMetadataTokenGuard } from 'src/engine/core-modules/workspace/internal/guards/internal-metadata-token.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@Controller('internal/workspaces')
@UseGuards(InternalMetadataTokenGuard, NoPermissionGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class InternalWorkspaceProvisioningController {
  constructor(
    private readonly internalWorkspaceProvisioningService: InternalWorkspaceProvisioningService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createWorkspace(@Body() body: InternalWorkspaceProvisioningDto) {
    return await this.internalWorkspaceProvisioningService.createWorkspace(
      body,
    );
  }

  @Post(':workspaceId/activate')
  @HttpCode(HttpStatus.OK)
  async activateWorkspace(
    @Param('workspaceId', new ParseUUIDPipe({ version: '4' }))
    workspaceId: string,
  ) {
    return await this.internalWorkspaceProvisioningService.activateWorkspace(
      workspaceId,
    );
  }

  @Post(':workspaceId/api-keys')
  @HttpCode(HttpStatus.OK)
  async createWorkspaceApiKey(
    @Param('workspaceId', new ParseUUIDPipe({ version: '4' }))
    workspaceId: string,
    @Body() body: InternalWorkspaceApiKeyDto,
  ) {
    return await this.internalWorkspaceProvisioningService.createWorkspaceApiKey(
      workspaceId,
      body,
    );
  }
}
