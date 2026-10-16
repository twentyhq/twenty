/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';

import { BillingSeatChangeEntity } from 'src/engine/core-modules/billing/entities/billing-seat-change.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingSeatChangeService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingSeatChangeEntity)
    private readonly billingSeatChangeRepository: WorkspaceScopedRepository<BillingSeatChangeEntity>,
  ) {}

  async recordSeatChange(
    change: Pick<
      BillingSeatChangeEntity,
      | 'workspaceId'
      | 'billingSubscriptionId'
      | 'previousSeats'
      | 'seats'
      | 'changedAt'
      | 'stripeEventId'
    >,
  ): Promise<void> {
    await this.billingSeatChangeRepository
      .createQueryBuilder()
      .insert()
      .values(change)
      .orIgnore()
      .execute();
  }

  async findSeatChangesSince({
    workspaceId,
    billingSubscriptionId,
    periodStart,
  }: {
    workspaceId: string;
    billingSubscriptionId: string;
    periodStart: Date;
  }): Promise<BillingSeatChangeEntity[]> {
    return this.billingSeatChangeRepository.find(workspaceId, {
      where: { billingSubscriptionId, changedAt: MoreThanOrEqual(periodStart) },
    });
  }
}
