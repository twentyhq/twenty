import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import Stripe from 'stripe';

import { CreateOnboardingPlansInput } from 'src/engine/core-modules/onboarding-plans/dtos/onboarding-plans.input';
import { UpdateOnboardingPlansInput } from 'src/engine/core-modules/onboarding-plans/dtos/update-onboarding-plans.input';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { OnboardingPlans } from './onboarding-plans.entity';

@Injectable()
export class OnboardingPlansService {
  private readonly stripe: Stripe;

  constructor(
    @InjectRepository(OnboardingPlans, 'core')
    private readonly repo: Repository<OnboardingPlans>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {
    this.stripe = new Stripe(
      this.twentyConfigService.get('WEBHOOK_STRIPE_SECRETKEY'),
      {
        apiVersion: '2024-10-28.acacia',
      },
    );
  }

  async create(dto: CreateOnboardingPlansInput) {
    const product = await this.stripe.products.create({
      name: dto.title,
      description: dto.features.join(', '),
    });

    const price = await this.stripe.prices.create({
      unit_amount: dto.price,
      currency: 'brl',
      product: product.id,
      recurring: dto.type !== 'Prepaid' ? { interval: 'month' } : undefined,
    });

    const plan = this.repo.create({
      ...dto,
      stripe_product_id: product.id,
      stripe_price_id: price.id,
    });

    return this.repo.save(plan);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  update(id: string, dto: UpdateOnboardingPlansInput) {
    return this.repo.update(id, dto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
