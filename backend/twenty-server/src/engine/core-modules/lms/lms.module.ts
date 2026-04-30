import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LMSCourseEntity, LMSEnrollmentEntity, RetentionQuizEntity } from './lms.entity';
import { LMSService } from './lms.service';
import { LMSResolver } from './lms.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([LMSCourseEntity, LMSEnrollmentEntity, RetentionQuizEntity])],
  providers: [LMSService, LMSResolver],
  exports: [LMSService],
})
export class LMSModule {}
