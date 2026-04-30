import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankConnectionEntity, BankTransactionEntity, BankReconciliationEntity, PaymentFileEntity } from './banking-latam.entity';
import { BankingLatamService } from './banking-latam.service';
import { BankingLatamResolver } from './banking-latam.resolver';
import { BankingLatamController } from './banking-latam.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BankConnectionEntity, BankTransactionEntity, BankReconciliationEntity, PaymentFileEntity])],
  controllers: [BankingLatamController],
  providers: [BankingLatamService, BankingLatamResolver],
  exports: [BankingLatamService],
})
export class BankingLatamModule {}
