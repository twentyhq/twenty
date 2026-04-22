import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerHealthEntity, NPSSurveyEntity } from './health-score.entity';
import { CustomerSuccessService } from './health-score.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerHealthEntity, NPSSurveyEntity])],
  providers: [CustomerSuccessService],
  exports: [CustomerSuccessService],
})
export class CustomerSuccessModule {}