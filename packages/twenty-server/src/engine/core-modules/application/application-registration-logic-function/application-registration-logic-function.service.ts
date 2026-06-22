import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';

@Injectable()
export class ApplicationRegistrationLogicFunctionService {
  constructor(
    @InjectRepository(ApplicationRegistrationLogicFunctionEntity)
    private readonly repository: Repository<ApplicationRegistrationLogicFunctionEntity>,
  ) {}

  async setDisabled({
    id,
    disabled,
  }: {
    id: string;
    disabled: boolean;
  }): Promise<void> {
    await this.repository.update(id, {
      disabledAt: disabled ? new Date() : null,
    });
  }
}
