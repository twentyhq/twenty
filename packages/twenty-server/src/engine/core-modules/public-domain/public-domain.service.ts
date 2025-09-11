import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { PublicDomainDTO } from 'src/engine/core-modules/public-domain/dtos/public-domain.dto';
import { PublicDomain } from 'src/engine/core-modules/public-domain/public-domain.entity';
import {
  PublicDomainException,
  PublicDomainExceptionCode,
} from 'src/engine/core-modules/public-domain/public-domain.exception';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';

@Injectable()
export class PublicDomainService {
  constructor(
    private readonly dnsManagerService: DnsManagerService,
    @InjectRepository(PublicDomain)
    private readonly publicDomainRepository: Repository<PublicDomain>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async deletePublicDomain({
    domain,
    workspace,
  }: {
    domain: string;
    workspace: Workspace;
  }): Promise<void> {
    const formattedDomain = domain.trim().toLowerCase();

    await this.dnsManagerService.deleteHostnameSilently(formattedDomain, {
      isPublicDomain: true,
    });

    await this.publicDomainRepository.delete({
      domain: formattedDomain,
      workspaceId: workspace.id,
    });
  }

  async createPublicDomain({
    domain,
    workspace,
  }: {
    domain: string;
    workspace: Workspace;
  }): Promise<PublicDomainDTO> {
    const formattedDomain = domain.trim().toLowerCase();

    if (
      await this.workspaceRepository.findOneBy({
        customDomain: formattedDomain,
      })
    ) {
      throw new PublicDomainException(
        'Domain already used for workspace custom domain',
        PublicDomainExceptionCode.DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN,
        {
          userFriendlyMessage: t`Domain already used for workspace custom domain`,
        },
      );
    }

    if (
      await this.publicDomainRepository.findOneBy({
        domain: formattedDomain,
        workspaceId: workspace.id,
      })
    ) {
      throw new PublicDomainException(
        'Public domain already registered',
        PublicDomainExceptionCode.PUBLIC_DOMAIN_ALREADY_REGISTERED,
        {
          userFriendlyMessage: t`Public domain already registered`,
        },
      );
    }

    const publicDomain = this.publicDomainRepository.create({
      domain: formattedDomain,
      workspaceId: workspace.id,
    });

    await this.dnsManagerService.registerHostname(formattedDomain, {
      isPublicDomain: true,
    });

    try {
      await this.publicDomainRepository.insert(publicDomain);
    } catch (error) {
      await this.dnsManagerService.deleteHostnameSilently(formattedDomain, {
        isPublicDomain: true,
      });

      throw error;
    }

    return publicDomain;
  }
}
