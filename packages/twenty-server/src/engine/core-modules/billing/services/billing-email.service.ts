/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type BillingEmailDTO } from 'src/engine/core-modules/billing/dtos/billing-email.dto';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingEmailService {
  constructor(
    private readonly stripeCustomerService: StripeCustomerService,
    @InjectWorkspaceScopedRepository(BillingCustomerEntity)
    private readonly billingCustomerRepository: WorkspaceScopedRepository<BillingCustomerEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async getBillingEmail(workspaceId: string): Promise<BillingEmailDTO> {
    const billingCustomer = await this.billingCustomerRepository.findOne(
      workspaceId,
      { where: {} },
    );

    if (!isDefined(billingCustomer)) {
      return { email: null, belongsToWorkspaceMember: false };
    }

    const { email } =
      await this.stripeCustomerService.getCustomerPartnerAndEmail(
        billingCustomer.stripeCustomerId,
      );

    if (!isNonEmptyString(email)) {
      return { email: null, belongsToWorkspaceMember: false };
    }

    const belongsToWorkspaceMember = await this.userWorkspaceRepository.exists({
      where: { workspaceId, user: { email: email.trim() } },
    });

    return { email, belongsToWorkspaceMember };
  }
}
