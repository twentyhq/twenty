/* @license Enterprise */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingArrangementEntity } from 'src/engine/core-modules/billing/entities/billing-arrangement.entity';
import { BillingArrangementService } from 'src/engine/core-modules/billing/services/billing-arrangement.service';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [TypeOrmModule.forFeature([BillingArrangementEntity])],
  providers: [
    BillingArrangementService,
    provideWorkspaceScopedRepository(BillingArrangementEntity),
  ],
  exports: [BillingArrangementService],
})
export class BillingArrangementModule {}
