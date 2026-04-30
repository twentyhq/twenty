import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity, RecruitmentCandidateEntity, PayrollRecordEntity, PerformanceReviewEntity, LeaveRequestEntity, EmployeeSatisfactionEntity } from './hrm.entity';
import { HRMService } from './hrm.service';
import { HRMResolver } from './hrm.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity, RecruitmentCandidateEntity, PayrollRecordEntity, PerformanceReviewEntity, LeaveRequestEntity, EmployeeSatisfactionEntity])],
  providers: [HRMService, HRMResolver],
  exports: [HRMService],
})
export class HRMModule {}
