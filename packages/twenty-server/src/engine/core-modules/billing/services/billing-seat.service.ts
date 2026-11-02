/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { SEAT_BILLING_ARRANGEMENT_TYPES } from 'src/engine/core-modules/billing/constants/seat-billing-arrangement-types.constant';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { isSeatLimitReached } from 'src/engine/core-modules/billing/utils/is-seat-limit-reached.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class BillingSeatService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async countWorkspaceMembers(workspaceId: string): Promise<number> {
    const authContext = buildSystemAuthContext(workspaceId);

    return await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceMemberRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkspaceMemberWorkspaceEntity>(
            'workspaceMember',
          );

        return await workspaceMemberRepository.count();
      },
      authContext,
    );
  }

  async findSeatArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      where: { type: In(SEAT_BILLING_ARRANGEMENT_TYPES) },
    });
  }

  async assertWorkspaceHasSeatForNewMember(workspaceId: string) {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const seatArrangements = await this.findSeatArrangements(workspaceId);

    if (seatArrangements.length === 0) {
      return;
    }

    if (
      isSeatLimitReached({
        memberCount: await this.countWorkspaceMembers(workspaceId),
        seatArrangements,
        now: new Date(),
      })
    ) {
      throw new BillingException(
        `Workspace ${workspaceId} has reached its committed seats`,
        BillingExceptionCode.BILLING_SEAT_LIMIT_REACHED,
      );
    }
  }
}
