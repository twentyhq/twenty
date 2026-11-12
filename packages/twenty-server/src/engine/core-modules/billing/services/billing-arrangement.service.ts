/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager, In } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { type BillingArrangementType } from 'src/engine/core-modules/billing/enums/billing-arrangement-type.enum';
import { type BillingArrangementDraft } from 'src/engine/core-modules/billing/types/billing-arrangement-draft.type';
import { findOverlappingBillingArrangement } from 'src/engine/core-modules/billing/utils/find-overlapping-billing-arrangement.util';
import { getBillingArrangementValidationErrors } from 'src/engine/core-modules/billing/utils/get-billing-arrangement-validation-errors.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class BillingArrangementService {
  constructor(
    @InjectWorkspaceScopedRepository(BillingArrangementEntity)
    private readonly billingArrangementRepository: WorkspaceScopedRepository<BillingArrangementEntity>,
  ) {}

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
        BillingExceptionCode.BILLING_ARRANGEMENT_INVALID,
      );
    }

    return billingArrangementRepository.insertAndReturnOne(workspaceId, {
      ...arrangement,
      workspaceId,
      grantedByUserId,
    });
  }
}
