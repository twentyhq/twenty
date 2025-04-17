import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateStripeIntegrationInput } from 'src/engine/core-modules/stripe/integrations/dtos/create-stripe-integration.input';
import { UpdateStripeIntegrationInput } from 'src/engine/core-modules/stripe/integrations/dtos/update-stripe-integration.input';
import { StripeIntegration } from 'src/engine/core-modules/stripe/integrations/stripe-integration.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class StripeIntegrationService {
  constructor(
    @InjectRepository(StripeIntegration, 'core')
    private stripeIntegrationRepository: Repository<StripeIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async create(
    createInput: CreateStripeIntegrationInput,
  ): Promise<StripeIntegration> {
    const currentWorkspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!currentWorkspace) {
      throw new Error('Workspace not found');
    }

    const createdIntegration = this.stripeIntegrationRepository.create({
      ...createInput,
      workspace: currentWorkspace,
    });

    await this.stripeIntegrationRepository.save(createdIntegration);

    return createdIntegration;
  }

  async saveAccountId(
    accountId: string,
    workspaceId: string,
  ): Promise<StripeIntegration> {
    const currentWorkspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!currentWorkspace) {
      throw new Error('Workspace not found');
    }

    const stripeIntegration = this.stripeIntegrationRepository.create({
      accountId,
      workspace: currentWorkspace,
    });

    return this.stripeIntegrationRepository.save(stripeIntegration);
  }

  async findAll(workspaceId: string): Promise<StripeIntegration[]> {
    const result = await this.stripeIntegrationRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    return result;
  }

  async findById(id: string): Promise<StripeIntegration | null> {
    return await this.stripeIntegrationRepository.findOne({
      where: { id },
    });
  }

  async update(
    updateInput: UpdateStripeIntegrationInput,
  ): Promise<StripeIntegration> {
    const stripeIntegration = await this.stripeIntegrationRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!stripeIntegration) {
      throw new Error('Integration not found');
    }

    const updatedIntegration = this.stripeIntegrationRepository.create({
      ...stripeIntegration,
      ...updateInput,
    });

    await this.stripeIntegrationRepository.save(updatedIntegration);

    return updatedIntegration;
  }

  async remove(accountId: string): Promise<boolean> {
    const stripeIntegration = await this.stripeIntegrationRepository.findOne({
      where: { accountId: accountId.toString() },
    });

    if (!stripeIntegration) {
      throw new Error('Integration not found');
    }

    await this.stripeIntegrationRepository.delete(stripeIntegration.id);

    return true;
  }
}
