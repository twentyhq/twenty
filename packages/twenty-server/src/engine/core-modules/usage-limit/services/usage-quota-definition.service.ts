import { Injectable } from '@nestjs/common';

import { type UsageQuotaDefinitionsDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definitions.dto';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { buildQuotaDefinitions } from 'src/engine/core-modules/usage-limit/utils/build-quota-definitions.util';

@Injectable()
export class UsageQuotaDefinitionService {
  constructor(
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usagePeriodService: UsagePeriodService,
  ) {}

  async findDefinitions(
    workspaceId: string,
  ): Promise<UsageQuotaDefinitionsDTO> {
    const [isIntraWorkspaceLimitEntitled, hasAllowancePeriod] =
      await Promise.all([
        this.usageLimitEntitlementService.isIntraWorkspaceLimitEntitled(
          workspaceId,
        ),
        this.usagePeriodService.hasAllowancePeriod(workspaceId),
      ]);

    return {
      definitions: buildQuotaDefinitions(),
      isIntraWorkspaceLimitEntitled,
      hasAllowancePeriod,
    };
  }
}
