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

import { ProvisionWorkspaceMemberDto } from 'src/engine/core-modules/workspace/internal/dtos/provision-workspace-member.dto';
import { InternalMetadataTokenGuard } from 'src/engine/core-modules/workspace/internal/guards/internal-metadata-token.guard';
import { InternalWorkspaceMemberProvisioningService } from 'src/engine/core-modules/workspace/internal/internal-workspace-member-provisioning.service';
import { type ProvisionWorkspaceMemberResult } from 'src/engine/core-modules/workspace/internal/types/internal-workspace-member-provisioning.type';
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
export class InternalWorkspaceMemberProvisioningController {
  constructor(
    private readonly internalWorkspaceMemberProvisioningService: InternalWorkspaceMemberProvisioningService,
  ) {}

  @Post(':workspaceId/members')
  @HttpCode(HttpStatus.OK)
  async provisionWorkspaceMember(
    @Param('workspaceId', new ParseUUIDPipe({ version: '4' }))
    workspaceId: string,
    @Body() body: ProvisionWorkspaceMemberDto,
  ): Promise<ProvisionWorkspaceMemberResult> {
    return await this.internalWorkspaceMemberProvisioningService.provisionWorkspaceMember(
      {
        workspaceId,
        id: body.id,
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
      },
    );
  }
}
