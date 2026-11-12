/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager, In, IsNull } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';
import { getBillingArrangementEndDate } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-end-date.util';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingArrangementService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
  ) {}

  async findArrangements(
    workspaceId: string,
  ): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      order: { startsAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findArrangementsByTypes({
    workspaceId,
    types,
  }: {
    workspaceId: string;
    types: BillingArrangementType[];
  }): Promise<BillingArrangementEntity[]> {
    return await this.billingArrangementRepository.find(workspaceId, {
      where: { type: In(types) },
    });
  }

  async insertArrangement({
    workspaceId,
    arrangement,
    grantedByUserId,
    entityManager,
  }: {
    workspaceId: string;
    arrangement: BillingArrangementDraft;
    grantedByUserId: string | null;
    entityManager?: EntityManager;
  }): Promise<BillingArrangementEntity> {
    const validationErrors = getBillingArrangementValidationErrors(arrangement);

    if (isNonEmptyArray(validationErrors)) {
      throw new BillingException(
        `Invalid ${arrangement.type} arrangement for workspace ${workspaceId}: ${validationErrors.map(({ code }) => code).join(', ')}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
      );
    }

    const billingArrangementRepository = isDefined(entityManager)
      ? this.billingArrangementRepository.withManager(entityManager)
      : this.billingArrangementRepository;

    const overlappingArrangement = findOverlappingBillingArrangement({
      arrangement: { ...arrangement, revokedAt: null },
      workspaceArrangements: await billingArrangementRepository.find(
        workspaceId,
        { where: { type: arrangement.type } },
      ),
    });

    if (isDefined(overlappingArrangement)) {
      throw new BillingException(
        `${arrangement.type} arrangement for workspace ${workspaceId} overlaps arrangement ${overlappingArrangement.id}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_OVERLAP,
      );
    }

    return billingArrangementRepository.insertAndReturnOne(workspaceId, {
      ...arrangement,
      workspaceId,
      grantedByUserId,
    });
  }

  async findArrangementOrFail({
    workspaceId,
    arrangementId,
  }: {
    workspaceId: string;
    arrangementId: string;
  }): Promise<BillingArrangementEntity> {
    const arrangement = await this.billingArrangementRepository.findOne(
      workspaceId,
      { where: { id: arrangementId } },
    );

    if (!isDefined(arrangement)) {
      throw new BillingException(
        `Billing arrangement ${arrangementId} not found for workspace ${workspaceId}`,
        BillingExceptionCode.BILLING_ARRANGEMENT_NOT_FOUND,
      );
    }

    return arrangement;
  }

  async endArrangement({
    arrangement,
    revokedByUserId,
  }: {
    arrangement: BillingArrangementEntity;
    revokedByUserId: string | null;
  }): Promise<BillingArrangementEntity> {
    const now = new Date();
    const endDate = getBillingArrangementEndDate(arrangement);

    if (isDefined(endDate) && endDate <= now) {
      return arrangement;
    }

    await this.billingArrangementRepository.update(
      arrangement.workspaceId,
      { id: arrangement.id, revokedAt: IsNull() },
      { revokedAt: now, revokedByUserId },
    );

    return await this.billingArrangementRepository.findOneOrFail(
      arrangement.workspaceId,
      { where: { id: arrangement.id } },
    );
  }
}
