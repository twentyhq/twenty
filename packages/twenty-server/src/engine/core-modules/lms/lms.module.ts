import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LMSCourseEntity, LMSEnrollmentEntity, RetentionQuizEntity } from './lms.entity';
import { LMSService } from './lms.service';

@Module({
  imports: [TypeOrmModule.forFeature([LMSCourseEntity, LMSEnrollmentEntity, RetentionQuizEntity])],
  providers: [LMSService],
  exports: [LMSService],
})
export class LMSModule {}
