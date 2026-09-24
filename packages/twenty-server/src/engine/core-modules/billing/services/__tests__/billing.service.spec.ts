/* @license Enterprise */

import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { RegisterPaymentMethodDomainJob } from 'src/engine/core-modules/billing/jobs/register-payment-method-domain.job';
import { BillingProductService } from 'src/engine/core-modules/billing/services/billing-product.service';
import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { StripeCustomerService } from 'src/engine/core-modules/billing/stripe/services/stripe-customer.service';
import { DomainServerConfigService } from 'src/engine/core-modules/domain/domain-server-config/services/domain-server-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('BillingService', () => {
  let service: BillingService;
  let config: Record<string, unknown>;

  const billingQueue = { add: jest.fn() };
  const noop = {};

  const workspace = {
    subdomain: 'acme',
    customDomain: null,
    isCustomDomainEnabled: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    config = {
      IS_BILLING_ENABLED: true,
      IS_MULTIWORKSPACE_ENABLED: true,
      FRONTEND_URL: 'https://twenty.com',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        WorkspaceDomainsService,
        DomainServerConfigService,
        {
          provide: TwentyConfigService,
          useValue: { get: (key: string) => config[key] },
        },
        {
          provide: getQueueToken(MessageQueue.billingQueue),
          useValue: billingQueue,
        },
        { provide: BillingSubscriptionService, useValue: noop },
        { provide: BillingProductService, useValue: noop },
        { provide: StripeCustomerService, useValue: noop },
        { provide: WorkspaceCacheService, useValue: noop },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingSubscriptionEntity),
          useValue: noop,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(BillingCustomerEntity),
          useValue: noop,
        },
        { provide: getRepositoryToken(WorkspaceEntity), useValue: noop },
        { provide: getRepositoryToken(PublicDomainEntity), useValue: noop },
      ],
    }).compile();

    service = module.get(BillingService);
  });

  describe('registerPaymentMethodDomain', () => {
    it('should register the workspace subdomain in the background', async () => {
      await service.registerPaymentMethodDomain(workspace);

      expect(billingQueue.add).toHaveBeenCalledWith(
        RegisterPaymentMethodDomainJob.name,
        { domainName: 'acme.twenty.com' },
        expect.anything(),
      );
    });

    it('should skip servers without billing', async () => {
      config.IS_BILLING_ENABLED = false;

      await service.registerPaymentMethodDomain(workspace);

      expect(billingQueue.add).not.toHaveBeenCalled();
    });

    it('should skip servers that are not served over HTTPS', async () => {
      config.FRONTEND_URL = 'http://localhost:3001';

      await service.registerPaymentMethodDomain(workspace);

      expect(billingQueue.add).not.toHaveBeenCalled();
    });
  });
});
