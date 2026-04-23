import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AuditService } from 'src/engine/core-modules/audit/services/audit.service';
import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { CUSTOM_DOMAIN_DEACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-deactivated';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DomainValidRecords } from 'src/engine/core-modules/dns-manager/dtos/domain-valid-records';
import { DnsManagerService } from 'src/engine/core-modules/dns-manager/services/dns-manager.service';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

@Injectable()
export class CustomDomainManagerService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(PublicDomainEntity)
    private readonly publicDomainRepository: Repository<PublicDomainEntity>,
    private readonly billingService: BillingService,
    private readonly dnsManagerService: DnsManagerService,
    private readonly auditService: AuditService,
  ) {}

  async isCustomDomainEnabled(workspaceId: string) {
    const isCustomDomainBillingEnabled =
      await this.billingService.hasEntitlement(
        workspaceId,
        BillingEntitlementKey.CUSTOM_DOMAIN,
      );

    if (!isCustomDomainBillingEnabled) {
      throw new WorkspaceException(
        `No entitlement found for this workspace`,
        WorkspaceExceptionCode.WORKSPACE_CUSTOM_DOMAIN_DISABLED,
      );
    }
  }

  async setCustomDomain(workspace: WorkspaceEntity, customDomain: string) {
    await this.isCustomDomainEnabled(workspace.id);

    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { customDomain },
    });

    if (existingWorkspace && existingWorkspace.id !== workspace.id) {
      throw new WorkspaceException(
        'Domain already taken',
        WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN,
      );
    }

    if (
      await this.publicDomainRepository.findOneBy({
        domain: customDomain,
      })
    ) {
      throw new WorkspaceException(
        'Domain is already registered as public domain',
        WorkspaceExceptionCode.DOMAIN_ALREADY_TAKEN,
        {
          userFriendlyMessage: msg`Domain is already registered as public domain`,
        },
      );
    }

    if (!isDefined(customDomain) || workspace.customDomain === customDomain) {
      return;
    }

    if (isDefined(workspace.customDomain)) {
      await this.dnsManagerService.updateHostname(
        workspace.customDomain,
        customDomain,
      );
    } else {
      await this.dnsManagerService.registerHostname(customDomain);
    }
  }

  async checkCustomDomainValidRecords(
    workspace: WorkspaceEntity,
    domainValidRecord?: DomainValidRecords,
  ) {
    assertIsDefinedOrThrow(workspace.customDomain);

    const customDomainWithRecords =
      domainValidRecord ??
      (await this.dnsManagerService.getHostnameWithRecords(
        workspace.customDomain,
      ));

    assertIsDefinedOrThrow(customDomainWithRecords);

    const isCustomDomainWorking =
      await this.dnsManagerService.isHostnameWorking(workspace.customDomain);

    if (workspace.isCustomDomainEnabled !== isCustomDomainWorking) {
      workspace.isCustomDomainEnabled = isCustomDomainWorking;

      await this.workspaceRepository.save(workspace);

      const analytics = this.auditService.createContext({
        workspaceId: workspace.id,
      });

      analytics.insertWorkspaceEvent(
        workspace.isCustomDomainEnabled
          ? CUSTOM_DOMAIN_ACTIVATED_EVENT
          : CUSTOM_DOMAIN_DEACTIVATED_EVENT,
        {},
      );
    }

    return customDomainWithRecords;
  }
}
