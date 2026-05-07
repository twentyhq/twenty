import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { PublicDomainDTO } from 'src/engine/core-modules/public-domain/dtos/public-domain.dto';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import {
  PublicDomainException,
  PublicDomainExceptionCode,
} from 'src/engine/core-modules/public-domain/public-domain.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';

@Injectable()
export class PublicDomainService {
  constructor(
    private readonly dnsManagerService: DnsManagerService,
    @InjectRepository(PublicDomainEntity)
    private readonly publicDomainRepository: Repository<PublicDomainEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  async deletePublicDomain({
    domain,
    workspace,
  }: {
    domain: string;
    workspace: WorkspaceEntity;
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
    applicationId,
  }: {
    domain: string;
    workspace: WorkspaceEntity;
    applicationId: string | null;
  }): Promise<PublicDomainDTO> {
    const formattedDomain = domain.trim().toLowerCase();

    const [workspaceWithCustomDomain, existingPublicDomain, application] =
      await Promise.all([
        this.workspaceRepository.findOneBy({ customDomain: formattedDomain }),
        this.publicDomainRepository.findOneBy({
          domain: formattedDomain,
          workspaceId: workspace.id,
        }),
        isDefined(applicationId)
          ? this.applicationRepository.findOneBy({
              id: applicationId,
              workspaceId: workspace.id,
            })
          : Promise.resolve(null),
      ]);

    if (isDefined(workspaceWithCustomDomain)) {
      throw new PublicDomainException(
        'Domain already used for workspace custom domain',
        PublicDomainExceptionCode.DOMAIN_ALREADY_REGISTERED_AS_CUSTOM_DOMAIN,
        {
          userFriendlyMessage: msg`Domain already used for workspace custom domain`,
        },
      );
    }

    if (isDefined(existingPublicDomain)) {
      throw new PublicDomainException(
        'Public domain already registered',
        PublicDomainExceptionCode.PUBLIC_DOMAIN_ALREADY_REGISTERED,
        {
          userFriendlyMessage: msg`Public domain already registered`,
        },
      );
    }

    if (isDefined(applicationId) && !isDefined(application)) {
      throw new PublicDomainException(
        'Application not found in this workspace',
        PublicDomainExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const publicDomain = this.publicDomainRepository.create({
      domain: formattedDomain,
      workspaceId: workspace.id,
      applicationId,
    });

    await this.dnsManagerService.registerHostname(formattedDomain, {
      isPublicDomain: true,
    });

    try {
      await this.publicDomainRepository.insert(
        publicDomain as QueryDeepPartialEntity<
          Omit<PublicDomainEntity, 'workspace' | 'application'>
        >,
      );
    } catch (error) {
      await this.dnsManagerService.deleteHostnameSilently(formattedDomain, {
        isPublicDomain: true,
      });

      throw error;
    }

    return publicDomain;
  }

  async updatePublicDomainApplication({
    domain,
    workspace,
    applicationId,
  }: {
    domain: string;
    workspace: WorkspaceEntity;
    applicationId: string | null;
  }): Promise<PublicDomainDTO> {
    const formattedDomain = domain.trim().toLowerCase();

    const [publicDomain, application] = await Promise.all([
      this.publicDomainRepository.findOneBy({
        domain: formattedDomain,
        workspaceId: workspace.id,
      }),
      isDefined(applicationId)
        ? this.applicationRepository.findOneBy({
            id: applicationId,
            workspaceId: workspace.id,
          })
        : Promise.resolve(null),
    ]);

    if (!isDefined(publicDomain)) {
      throw new PublicDomainException(
        `Public domain ${domain} not found`,
        PublicDomainExceptionCode.PUBLIC_DOMAIN_NOT_FOUND,
      );
    }

    if (isDefined(applicationId) && !isDefined(application)) {
      throw new PublicDomainException(
        'Application not found in this workspace',
        PublicDomainExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    publicDomain.applicationId = applicationId;

    return this.publicDomainRepository.save(publicDomain);
  }

  async checkPublicDomainValidRecords(
    publicDomain: PublicDomainEntity,
    domainValidRecords?: DomainValidRecords,
  ): Promise<DomainValidRecords | undefined> {
    const publicDomainWithRecords =
      domainValidRecords ??
      (await this.dnsManagerService.getHostnameWithRecords(
        publicDomain.domain,
        {
          isPublicDomain: true,
        },
      ));

    if (!publicDomainWithRecords) return;

    const isCustomDomainWorking =
      await this.dnsManagerService.isHostnameWorking(publicDomain.domain, {
        isPublicDomain: true,
      });

    if (publicDomain.isValidated !== isCustomDomainWorking) {
      publicDomain.isValidated = isCustomDomainWorking;

      await this.publicDomainRepository.save(publicDomain);
    }

    return publicDomainWithRecords;
  }

  async findByDomain(domain: string) {
    return this.publicDomainRepository.findOne({ where: { domain } });
  }
}
