import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class DnsCloudflareService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly publicDomainService: PublicDomainService,
  ) {}

  async checkHostname(hostname: string) {
    const workspace = await this.workspaceService.findByCustomDomain(hostname);

    if (isDefined(workspace)) {
      await this.workspaceService.checkCustomDomainValidRecords(workspace);
    }

    const publicDomain = await this.publicDomainService.findByDomain(hostname);

    if (isDefined(publicDomain)) {
      await this.publicDomainService.checkPublicDomainValidRecords(
        publicDomain,
      );
    }
  }
}
