import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TwoFactorMethod } from './two-factor-method.entity';

@Injectable()
export class TwoFactorMethodService {
  constructor(
    @InjectRepository(TwoFactorMethod)
    private readonly twoFactorMethodRepository: Repository<TwoFactorMethod>,
  ) {}

  async createTwoFactorMethod(
    userWorkspaceId: string,
  ): Promise<TwoFactorMethod> {
    const twoFactorMethod = this.twoFactorMethodRepository.create({
      userWorkspace: { id: userWorkspaceId },
    });

    return this.twoFactorMethodRepository.save(twoFactorMethod);
  }

  async findAll(): Promise<TwoFactorMethod[]> {
    return this.twoFactorMethodRepository.find();
  }

  async findOne(id: string): Promise<TwoFactorMethod | null> {
    return this.twoFactorMethodRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.twoFactorMethodRepository.delete(id);
  }
}
