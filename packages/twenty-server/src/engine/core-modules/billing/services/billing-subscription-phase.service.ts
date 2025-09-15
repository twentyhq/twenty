import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { BillingSubscriptionSchedulePhase } from 'src/engine/core-modules/billing/dtos/billing-subscription-schedule-phase.dto';
import { findOrThrow } from 'src/utils/find-or-throw.util';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingPlanService } from 'src/engine/core-modules/billing/services/billing-plan.service';

@Injectable()
export class BillingSubscriptionPhaseService {
  constructor(
    @InjectRepository(BillingPrice)
    private readonly billingPriceRepository: Repository<BillingPrice>,
    private readonly billingPlanService: BillingPlanService,
  ) {}

  async getDetailsFromPhase(phase: BillingSubscriptionSchedulePhase) {
    const meteredPrice = await this.billingPriceRepository.findOneByOrFail({
      stripePriceId: findOrThrow(
        phase.items,
        ({ quantity }) => !isDefined(quantity),
      ).price,
    });

    const { quantity, price: licensedItemPriceId } = findOrThrow(
      phase.items,
      ({ quantity }) => isDefined(quantity),
    );

    const licensedPrice = await this.billingPriceRepository.findOneByOrFail({
      stripePriceId: licensedItemPriceId,
    });

    const plan = await this.billingPlanService.getPlanByPriceId(
      meteredPrice.stripePriceId,
    );

    if (!isDefined(quantity)) {
      throw new Error('Quantity is not defined');
    }

    return {
      plan,
      meteredPrice,
      licensedPrice,
      quantity,
      interval: meteredPrice.interval,
    };
  }
}
