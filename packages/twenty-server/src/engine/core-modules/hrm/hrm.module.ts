import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity, RecruitmentCandidateEntity, PayrollRecordEntity, PerformanceReviewEntity, LeaveRequestEntity, EmployeeSatisfactionEntity } from './hrm.entity';
import { HRMService } from './hrm.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity, RecruitmentCandidateEntity, PayrollRecordEntity, PerformanceReviewEntity, LeaveRequestEntity, EmployeeSatisfactionEntity])],
  providers: [HRMService],
  exports: [HRMService],
})
export class HRMModule {}
