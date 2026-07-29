import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationJobResolver } from 'src/engine/core-modules/application/application-job/application-job.resolver';
import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogicFunctionEntity])],
  providers: [ApplicationJobService, ApplicationJobResolver],
  exports: [ApplicationJobService],
})
export class ApplicationJobModule {}
