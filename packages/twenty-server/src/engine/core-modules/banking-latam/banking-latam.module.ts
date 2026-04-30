import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankConnectionEntity, BankTransactionEntity, BankReconciliationEntity, PaymentFileEntity } from './banking-latam.entity';
import { BankingLatamService } from './banking-latam.service';
import { BankingLatamResolver } from './banking-latam.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([BankConnectionEntity, BankTransactionEntity, BankReconciliationEntity, PaymentFileEntity])],
  providers: [BankingLatamService, BankingLatamResolver],
  exports: [BankingLatamService],
})
export class BankingLatamModule {}
