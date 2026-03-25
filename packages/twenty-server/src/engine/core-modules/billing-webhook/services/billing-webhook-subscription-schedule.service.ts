/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Stripe from 'stripe';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase } from 'src/engine/core-modules/billing-webhook/utils/transform-stripe-subscription-schedule-event-to-database-subscription-phase.util';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { StripeSubscriptionScheduleService } from 'src/engine/core-modules/billing/stripe/services/stripe-subscription-schedule.service';

@Injectable()
export class BillingWebhookSubscriptionScheduleService {
  protected readonly logger = new Logger(
    BillingWebhookSubscriptionScheduleService.name,
  );

  constructor(
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
    private readonly stripeSubscriptionScheduleService: StripeSubscriptionScheduleService,
  ) {}

  async processStripeEvent(
    data:
      | Stripe.SubscriptionScheduleUpdatedEvent.Data
      | Stripe.SubscriptionScheduleCanceledEvent.Data,
  ) {
    const schedule = data.object as Stripe.SubscriptionSchedule;

    if (
      isDefined(schedule.released_subscription) &&
      schedule.status === 'released'
    ) {
      await this.billingSubscriptionRepository.update(
        { stripeSubscriptionId: schedule.released_subscription },
        {
          phases: [],
        },
      );

      return {
        stripeSubscriptionId: schedule.released_subscription,
        phasesCount: 0,
        scheduleId: schedule.id,
      };
    }

    if (!isDefined(schedule.subscription)) {
      throw new Error('Subscription is not defined');
    }

    const subscriptionId =
      typeof schedule.subscription === 'string'
        ? schedule.subscription
        : schedule.subscription.id;

    const subscriptionWithSchedule =
      await this.stripeSubscriptionScheduleService.getSubscriptionWithSchedule(
        subscriptionId,
      );

    await this.billingSubscriptionRepository.update(
      { stripeSubscriptionId: subscriptionWithSchedule.id },
      {
        phases:
          transformStripeSubscriptionScheduleEventToDatabaseSubscriptionPhase(
            schedule,
          ),
      },
    );

    return {
      stripeSubscriptionId: subscriptionWithSchedule.id,
      phasesCount: subscriptionWithSchedule.schedule?.phases?.length ?? 0,
      scheduleId: subscriptionWithSchedule.schedule?.id,
    };
  }
}
