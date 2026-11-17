import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { type AdminPanelWorkspaceBillingArrangementDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing-arrangement.dto';
import { type UserInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { fromBillingArrangementEntityToDto } from 'src/engine/core-modules/admin-panel/utils/from-billing-arrangement-entity-to-dto.util';
import { type BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { type UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class AdminPanelBillingArrangementService {
  constructor(
    private readonly billingArrangementService: BillingArrangementService,
    private readonly usageLimitService: UsageLimitService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findWorkspaceBillingArrangements(
    workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingArrangementDTO[]> {
    const arrangements =
      await this.billingArrangementService.findArrangements(workspaceId);
    const [operatorsById, usageLimitsById] = await Promise.all([
      this.findOperatorsById(arrangements),
      this.findUsageLimitsById({ workspaceId, arrangements }),
    ]);
    const now = new Date();

    return arrangements.map((arrangement) =>
      fromBillingArrangementEntityToDto({
        arrangement,
        now,
        operatorsById,
        usageLimitsById,
      }),
    );
  }

  private async findOperatorsById(
    arrangements: BillingArrangementEntity[],
  ): Promise<Map<string, UserInfoDTO>> {
    const userIds = [
      ...new Set(
        arrangements
          .flatMap(({ grantedByUserId, revokedByUserId }) => [
            grantedByUserId,
            revokedByUserId,
          ])
          .filter(isDefined),
      ),
    ];

    if (userIds.length === 0) {
      return new Map();
    }

    const users = await this.userRepository.find({
      where: { id: In(userIds) },
      withDeleted: true,
    });

    return new Map(
      users.map(({ id, email, firstName, lastName, createdAt }) => [
        id,
        { id, email, firstName, lastName, createdAt },
      ]),
    );
  }

  private async findUsageLimitsById({
    workspaceId,
    arrangements,
  }: {
    workspaceId: string;
    arrangements: BillingArrangementEntity[];
  }): Promise<Map<string, UsageLimitDTO>> {
    const usageLimitIds = [
      ...new Set(
        arrangements.map(({ usageLimitId }) => usageLimitId).filter(isDefined),
      ),
    ];

    if (usageLimitIds.length === 0) {
      return new Map();
    }

    const usageLimits = await this.usageLimitService.findByIds({
      workspaceId,
      usageLimitIds,
    });

    return new Map(
      usageLimits.map((usageLimit) => [
        usageLimit.id,
        fromUsageLimitEntityToDto(usageLimit),
      ]),
    );
  }
}
