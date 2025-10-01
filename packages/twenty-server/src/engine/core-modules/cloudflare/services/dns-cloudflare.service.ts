import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { PublicDomainService } from 'src/engine/core-modules/public-domain/public-domain.service';

@Injectable()
export class DnsCloudflareService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workspaceService: WorkspaceService,
    @InjectRepository(PublicDomain)
    private readonly publicDomainRepository: Repository<PublicDomain>,
    private readonly publicDomainService: PublicDomainService,
  ) {}

  async checkHostname(hostname: string) {
    const workspace = await this.workspaceRepository.findOneBy({
      customDomain: hostname,
    });

    if (isDefined(workspace)) {
      await this.workspaceService.checkCustomDomainValidRecords(workspace);
    }

    const publicDomain = await this.publicDomainRepository.findOneBy({
      domain: hostname,
    });

    if (isDefined(publicDomain)) {
      await this.publicDomainService.checkPublicDomainValidRecords(
        publicDomain,
      );
    }
  }
}
