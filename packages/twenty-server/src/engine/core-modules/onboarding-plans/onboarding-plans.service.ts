import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateOnboardingPlansInput } from 'src/engine/core-modules/onboarding-plans/dtos/onboarding-plans.input';
import { UpdateOnboardingPlansInput } from 'src/engine/core-modules/onboarding-plans/dtos/update-onboarding-plans.input';

import { OnboardingPlans } from './onboarding-plans.entity';

@Injectable()
export class OnboardingPlansService {
  constructor(
    @InjectRepository(OnboardingPlans, 'core')
    private readonly repo: Repository<OnboardingPlans>,
  ) {}

  create(dto: CreateOnboardingPlansInput) {
    const plan = this.repo.create(dto);

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
