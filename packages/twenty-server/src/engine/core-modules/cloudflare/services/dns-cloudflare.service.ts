import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class DnsCloudflareService {
  constructor(
    private readonly publicDomainService: PublicDomainService,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async checkHostname(hostname: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: { customDomain: hostname },
    });

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
