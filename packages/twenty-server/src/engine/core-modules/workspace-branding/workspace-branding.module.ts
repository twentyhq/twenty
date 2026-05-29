import { Module } from '@nestjs/common';

import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';

import { WorkspaceBrandingController } from './workspace-branding.controller';
import { WorkspaceBrandingMiddleware } from './workspace-branding.middleware';
import { WorkspaceBrandingService } from './workspace-branding.service';

@Module({
  imports: [WorkspaceDomainsModule, FileUrlModule],
  providers: [WorkspaceBrandingService, WorkspaceBrandingMiddleware],
  controllers: [WorkspaceBrandingController],
  exports: [WorkspaceBrandingMiddleware, WorkspaceBrandingService],
})
export class WorkspaceBrandingModule {}
