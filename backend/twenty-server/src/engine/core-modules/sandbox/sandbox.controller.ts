import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SandboxService } from './sandbox.service';

@Controller('sandbox')
@UseGuards(AuthGuard('jwt'))
export class SandboxController {
  constructor(private readonly sandboxService: SandboxService) {}

  @Get()
  async findAll(@Req() req: { user: { workspaceId: string } }) {
    return this.sandboxService.findByWorkspace(req.user.workspaceId);
  }

  @Get('summary')
  async summary(@Req() req: { user: { workspaceId: string } }) {
    return this.sandboxService.getSummary(req.user.workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.findOne(id, req.user.workspaceId);
  }

  @Post()
  async create(
    @Body() data: { name: string; description?: string; source?: string },
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.createSandbox(req.user.workspaceId, {
      name: data.name,
      description: data.description,
      source: data.source as any || 'production',
    });
  }

  @Put(':id/pause')
  async pause(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.pauseSandbox(id, req.user.workspaceId);
  }

  @Put(':id/resume')
  async resume(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.resumeSandbox(id, req.user.workspaceId);
  }

  @Put(':id/refresh')
  async refresh(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.refreshSandbox(id, req.user.workspaceId);
  }

  @Put(':id/auto-refresh')
  async setAutoRefresh(
    @Param('id') id: string,
    @Body() data: { enabled: boolean; intervalHours?: number },
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.setAutoRefresh(
      id,
      req.user.workspaceId,
      data.enabled,
      data.intervalHours,
    );
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: { user: { workspaceId: string } },
  ) {
    return this.sandboxService.deleteSandbox(id, req.user.workspaceId);
  }
}
