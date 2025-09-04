import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { t } from '@lingui/core/macro';
import { Repository } from 'typeorm';

import { PublicDomainDTO } from 'src/engine/core-modules/public-domain/dtos/public-domain.dto';
import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
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
    @InjectRepository(ApprovedAccessDomain)
    private readonly approvedAccessDomainRepository: Repository<ApprovedAccessDomain>,
    @InjectRepository(PublicDomain)
    private readonly publicDomainRepository: Repository<PublicDomain>,
  ) {}

  async deletePublicDomain({
    domain,
    workspaceId,
  }: {
    domain: string;
    workspaceId: string;
  }): Promise<void> {
    await this.dnsManagerService.deleteRedirectRuleSilently(domain);
    await this.dnsManagerService.deleteHostnameSilently(domain);
    await this.publicDomainRepository.delete({ domain, workspaceId });
  }

  async createPublicDomain({
    domain,
    workspaceId,
  }: {
    domain: string;
    workspaceId: string;
  }): Promise<PublicDomainDTO> {
    if (
      await this.publicDomainRepository.findOneBy({
        domain,
        workspaceId,
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

    if (
      await this.approvedAccessDomainRepository.findOneBy({
        domain,
        workspaceId,
      })
    ) {
      throw new PublicDomainException(
        'Domain already registered as an approved access domain.',
        PublicDomainExceptionCode.APPROVED_ACCESS_DOMAIN_ALREADY_REGISTERED,
        {
          userFriendlyMessage: t`Domain already registered as an approved access domain.`,
        },
      );
    }

    const publicDomain = this.publicDomainRepository.create({
      domain,
      workspaceId,
    });

    await this.dnsManagerService.registerHostname(domain);

    await this.dnsManagerService.registerRedirectRule(domain);

    try {
      await this.publicDomainRepository.insert(publicDomain);
    } catch (error) {
      await this.dnsManagerService.deleteRedirectRuleSilently(domain);
      await this.dnsManagerService.deleteHostnameSilently(domain);

      throw error;
    }

    return publicDomain;
  }
}
