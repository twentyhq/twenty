import { Module, type OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import express from 'express';
import { join } from 'path';

import { ClientConfigModule } from 'src/engine/core-modules/client-config/client-config.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { FrontendService } from 'src/engine/core-modules/frontend/frontend.service';

@Module({
  imports: [ClientConfigModule, WorkspaceDomainsModule],
  providers: [
    FrontendService,
    { provide: 'FRONTEND_PATH', useValue: join(__dirname, '../../../front') },
  ],
})
export class FrontendModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly frontendService: FrontendService,
  ) {}

  onModuleInit() {
    if (!this.frontendService.isEnabled) {
      return;
    }

    // Register after API controllers, before Nest's not-found handler.
    const adapter = this.httpAdapterHost.httpAdapter;

    adapter.use(this.frontendService.serveDocument.bind(this.frontendService));
    adapter.use(
      express.static(this.frontendService.frontPath, {
        index: false,
        redirect: false,
        setHeaders: (response, filePath) => {
          // Never let an alternate spelling of index.html bypass its dynamic policy.
          if (filePath.toLowerCase().endsWith('.html')) {
            response.setHeader('Cache-Control', 'no-store');
            response.setHeader('CDN-Cache-Control', 'no-store');
            response.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
            response.setHeader(
              'Content-Security-Policy',
              "frame-ancestors 'none'",
            );
            response.setHeader('X-Frame-Options', 'DENY');
          }
        },
      }),
    );
  }
}
