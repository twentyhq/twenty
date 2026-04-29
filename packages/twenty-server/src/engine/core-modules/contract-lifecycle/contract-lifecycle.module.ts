import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CLMContractEntity, CLMTemplateEntity } from './contract-lifecycle.entity';
import { ContractLifecycleService } from './contract-lifecycle.service';

@Module({
  imports: [TypeOrmModule.forFeature([CLMContractEntity, CLMTemplateEntity])],
  providers: [ContractLifecycleService],
  exports: [ContractLifecycleService],
})
export class ContractLifecycleModule {}
