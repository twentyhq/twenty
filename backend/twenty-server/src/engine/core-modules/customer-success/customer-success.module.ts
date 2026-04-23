import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerHealthEntity, NPSSurveyEntity } from './health-score.entity';
import { CustomerSuccessService } from './health-score.service';
import {
  CustomerSuccessPlaybookEntity,
  QBRRecordEntity,
  ExpansionRevenueEntity,
} from './customer-success-programs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerHealthEntity,
      NPSSurveyEntity,
      CustomerSuccessPlaybookEntity,
      QBRRecordEntity,
      ExpansionRevenueEntity,
    ]),
  ],
  providers: [CustomerSuccessService],
  exports: [CustomerSuccessService],
})
export class CustomerSuccessModule {}
